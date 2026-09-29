import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { STOREFRONT_URL } from "./constants"
import { escapeHtml, formatVnd } from "./format"
import { link, paragraph, sendEmail } from "./notify"

const service = (container: MedusaContainer): MarketplaceModuleService =>
  container.resolve(MARKETPLACE_MODULE)

const notFound = () =>
  new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy yêu cầu")

export async function createCustomRequest(
  container: MedusaContainer,
  customerId: string,
  input: {
    product_id: string
    description: string
    color?: string | null
    size?: string | null
    quantity?: number
  }
) {
  if (!input.description?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Vui lòng mô tả yêu cầu của bạn"
    )
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: products }, { data: customers }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail", "status", "variants.id", "artisan.*"],
      filters: { id: input.product_id },
    }),
    query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { id: customerId },
    }),
  ])

  const product = products[0] as any
  const customer = customers[0]
  const artisan = product?.artisan

  if (!product || product.status !== "published" || !artisan || artisan.status !== "active") {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Sản phẩm không nhận yêu cầu làm riêng"
    )
  }

  const request = await service(container).createCustomRequests({
    artisan_id: artisan.id,
    customer_id: customerId,
    customer_email: customer.email ?? "",
    customer_name:
      [customer.last_name, customer.first_name].filter(Boolean).join(" ") || null,
    product_id: product.id,
    variant_id: product.variants[0].id,
    product_title: product.title,
    thumbnail: product.thumbnail ?? null,
    description: input.description.trim(),
    color: input.color || null,
    size: input.size || null,
    quantity: Math.max(1, Number(input.quantity) || 1),
    status: "pending",
  })

  await sendEmail(
    container,
    artisan.email,
    `Yêu cầu làm riêng mới: ${product.title}`,
    paragraph(
      `Khách ${escapeHtml(request.customer_name ?? customer.email)} muốn đặt làm riêng <b>${escapeHtml(product.title)}</b> (${request.quantity} cái).`
    ) +
      paragraph(`Mô tả: ${escapeHtml(request.description)}`) +
      link(`${STOREFRONT_URL}/kenh-nghe-nhan/yeu-cau`, "Trả lời yêu cầu")
  )

  return request
}

/** The artisan's one answer: a price and a making time, or a refusal. */
export async function respondToCustomRequest(
  container: MedusaContainer,
  artisanId: string,
  requestId: string,
  input: {
    accept: boolean
    price?: number
    lead_days?: number
    note?: string | null
  }
) {
  const marketplace = service(container)
  const [request] = await marketplace.listCustomRequests({
    id: requestId,
    artisan_id: artisanId,
  })

  if (!request) {
    throw notFound()
  }

  if (request.status !== "pending") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Yêu cầu này đã được trả lời")
  }

  if (input.accept && (!(Number(input.price) > 0) || !(Number(input.lead_days) > 0))) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Vui lòng nhập giá và số ngày làm lớn hơn 0"
    )
  }

  const updated = await marketplace.updateCustomRequests({
    id: request.id,
    status: input.accept ? "quoted" : "artisan_declined",
    quoted_price: input.accept ? Number(input.price) : null,
    quoted_lead_days: input.accept ? Number(input.lead_days) : null,
    artisan_note: input.note || null,
    responded_at: new Date(),
  })

  await sendEmail(
    container,
    request.customer_email,
    input.accept
      ? `Nghệ nhân đã báo giá yêu cầu làm riêng: ${request.product_title}`
      : `Nghệ nhân từ chối yêu cầu làm riêng: ${request.product_title}`,
    (input.accept
      ? paragraph(
          `Giá: <b>${formatVnd(Number(input.price) * request.quantity)}</b> cho ${request.quantity} cái (${formatVnd(input.price)}/cái), thời gian làm: <b>${input.lead_days} ngày</b>. Bạn có thể đồng ý hoặc từ chối.`
        )
      : "") +
      (input.note ? paragraph(`Lời nhắn: ${escapeHtml(input.note)}`) : "") +
      link(`${STOREFRONT_URL}/account/yeu-cau-lam-rieng`, "Xem yêu cầu")
  )

  return updated
}

/** Puts the agreed item in the customer's cart at the quoted price. */
async function addAcceptedToCart(
  container: MedusaContainer,
  request: any,
  cartId: string,
  customerId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    fields: ["id", "customer_id", "completed_at", "items.metadata"],
    filters: { id: cartId },
  })

  if (!cart || cart.customer_id !== customerId || cart.completed_at) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Giỏ hàng không hợp lệ")
  }

  const alreadyInCart = (cart.items ?? []).some(
    (item: any) => item?.metadata?.custom_request_id === request.id
  )

  if (alreadyInCart) {
    return
  }

  await addToCartWorkflow(container).run({
    input: {
      cart_id: cartId,
      items: [
        {
          variant_id: request.variant_id,
          quantity: request.quantity,
          unit_price: Number(request.quoted_price),
          metadata: {
            custom_request_id: request.id,
            custom_note: [request.description, request.color, request.size]
              .filter(Boolean)
              .join(" · "),
          },
        },
      ],
    },
  })
}

/** The customer's one answer to the quote. Accepting adds it to the cart. */
export async function decideCustomRequest(
  container: MedusaContainer,
  customerId: string,
  requestId: string,
  input: { accept: boolean; cart_id?: string }
) {
  const marketplace = service(container)
  const [request] = await marketplace.listCustomRequests(
    { id: requestId, customer_id: customerId },
    { relations: ["artisan"] }
  )

  if (!request) {
    throw notFound()
  }

  // An accepted request that is not ordered yet can be put back in the cart.
  if (request.status === "accepted" && input.accept && input.cart_id) {
    await addAcceptedToCart(container, request, input.cart_id, customerId)
    return request
  }

  if (request.status !== "quoted") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Yêu cầu này không chờ bạn quyết định"
    )
  }

  if (input.accept) {
    if (!input.cart_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Thiếu giỏ hàng")
    }

    await addAcceptedToCart(container, request, input.cart_id, customerId)
  }

  const updated = await marketplace.updateCustomRequests({
    id: request.id,
    status: input.accept ? "accepted" : "customer_declined",
    decided_at: new Date(),
  })

  await sendEmail(
    container,
    request.artisan.email,
    input.accept
      ? `Khách đồng ý báo giá: ${request.product_title}`
      : `Khách từ chối báo giá: ${request.product_title}`,
    paragraph(
      input.accept
        ? "Khách đã đồng ý và đang thanh toán. Bạn sẽ nhận được đơn hàng khi khách đặt xong."
        : "Khách đã từ chối báo giá của bạn."
    )
  )

  return updated
}
