import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { escapeHtml } from "./format"
import {
  GHN_STATUS_LABELS,
  cancelGhnOrder,
  createGhnOrder,
  ghnTrackingUrl,
  isGhnConfigured,
  previewGhnOrder,
  type GhnOrderInput,
} from "./ghn"
import { notifyAdmin, paragraph } from "./notify"
import { toNumber } from "./numbers"
import {
  cancelSubOrder,
  getFullSubOrder,
  markDelivered,
  shipSubOrder,
} from "./transitions"

export const GHN_CARRIER = "GHN"

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

/**
 * Everything GHN needs for one sub-order: pickup at the artisan, delivery to
 * the customer (GHN district/ward saved at checkout) and, for COD, the goods
 * amount the shipper collects for Yarnly. The shipping fee itself is paid by
 * the customer to GHN on delivery.
 */
async function buildGhnInput(
  container: MedusaContainer,
  subOrderId: string,
  attempt: number
): Promise<GhnOrderInput> {
  const subOrder = await getFullSubOrder(container, subOrderId)
  const artisan = subOrder.artisan as any

  if (subOrder.status !== "ready_to_ship") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Đơn ${subOrder.code}: chỉ tạo vận đơn khi nghệ nhân đã báo làm xong`
    )
  }

  if (!artisan.pickup_district_name || !artisan.pickup_ward_name || !artisan.pickup_province_name) {
    throw invalid(
      `Nghệ nhân ${artisan.shop_name} chưa chọn Tỉnh/Quận/Phường lấy hàng trong Hồ sơ gian hàng`
    )
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productIds = subOrder.items.map((item: any) => item.product_id).filter(Boolean)
  const [{ data: orders }, { data: products }] = await Promise.all([
    query.graph({
      entity: "order",
      fields: ["id", "metadata", "shipping_address.*"],
      filters: { id: subOrder.marketplace_order.order_id },
    }),
    productIds.length
      ? query.graph({ entity: "product", fields: ["id", "weight"], filters: { id: productIds } })
      : Promise.resolve({ data: [] as any[] }),
  ])

  const order = orders[0] as any
  const address = order?.shipping_address
  const districtId = Number(order?.metadata?.district_id)
  const wardCode = order?.metadata?.ward_code ? String(order.metadata.ward_code) : ""

  if (!address?.phone || !districtId || !wardCode) {
    throw invalid(
      `Đơn ${subOrder.code} thiếu số điện thoại hoặc Quận/Phường GHN của khách (đơn cũ đặt trước khi có GHN). Hãy dùng "Nhập tay".`
    )
  }

  const weightOf = (productId: string | null) =>
    Number(products.find((product: any) => product.id === productId)?.weight) || 200

  return {
    // GHN refuses a client code it has seen before, so retries get a suffix.
    client_order_code: attempt ? `YARNLY${subOrder.code}-${attempt}` : `YARNLY${subOrder.code}`,
    from: {
      name: artisan.shop_name,
      phone: artisan.phone,
      address: artisan.pickup_address,
      ward_name: artisan.pickup_ward_name,
      district_name: artisan.pickup_district_name,
      province_name: artisan.pickup_province_name,
    },
    to: {
      name: [address.last_name, address.first_name].filter(Boolean).join(" ") || "Khách hàng",
      phone: address.phone,
      address: [address.address_1, address.city, address.province].filter(Boolean).join(", "),
      ward_code: wardCode,
      district_id: districtId,
    },
    items: subOrder.items.map((item: any) => ({
      name: item.variant_title ? `${item.title} (${item.variant_title})` : item.title,
      quantity: item.quantity,
      price: toNumber(item.unit_price),
      weight: weightOf(item.product_id),
    })),
    cod_amount:
      subOrder.marketplace_order.payment_method === "cod" ? toNumber(subOrder.subtotal) : 0,
    insurance_value: toNumber(subOrder.subtotal),
    content: `Yarnly đơn ${subOrder.code} – đồ len handmade`,
  }
}

const attemptsSoFar = async (container: MedusaContainer, subOrderId: string) => {
  const marketplace: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
  const subOrder = await marketplace.retrieveSubOrder(subOrderId)
  // carrier_status "cancel" means an earlier GHN order for it was canceled.
  return subOrder.carrier_status === "cancel" ? Date.now() % 100000 : 0
}

/** Fee and delivery date quoted by GHN; creates nothing. */
export async function quoteGhnShipment(container: MedusaContainer, subOrderId: string) {
  if (!isGhnConfigured()) {
    throw invalid("Chưa cấu hình GHN_API_TOKEN / GHN_SHOP_ID")
  }

  const input = await buildGhnInput(container, subOrderId, await attemptsSoFar(container, subOrderId))
  const quote = await previewGhnOrder(input)

  return {
    total_fee: quote.total_fee,
    expected_delivery_time: quote.expected_delivery_time ?? null,
    cod_amount: input.cod_amount,
    from: input.from,
    to: { ...input.to, phone: input.to.phone },
  }
}

/** Books the GHN pickup and moves the sub-order to "shipping". */
export async function createGhnShipment(container: MedusaContainer, subOrderId: string) {
  if (!isGhnConfigured()) {
    throw invalid("Chưa cấu hình GHN_API_TOKEN / GHN_SHOP_ID")
  }

  const input = await buildGhnInput(container, subOrderId, await attemptsSoFar(container, subOrderId))
  const created = await createGhnOrder(input)

  await shipSubOrder(container, subOrderId, {
    carrier: GHN_CARRIER,
    tracking_number: created.order_code,
    shipping_fee: created.total_fee ?? null,
    expected_delivery_at: created.expected_delivery_time
      ? new Date(created.expected_delivery_time)
      : null,
    carrier_status: "ready_to_pick",
  })

  return created
}

/**
 * Cancels the GHN order of a sub-order that was not picked up yet and puts
 * the sub-order back to "ready to ship", so a new shipment can be booked.
 */
export async function cancelGhnShipment(container: MedusaContainer, subOrderId: string) {
  const subOrder = await getFullSubOrder(container, subOrderId)

  if (subOrder.carrier !== GHN_CARRIER || !subOrder.tracking_number || subOrder.status !== "shipping") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `Đơn ${subOrder.code} không có vận đơn GHN đang giao`)
  }

  await cancelGhnOrder(subOrder.tracking_number)
  await backToReadyToShip(container, subOrder.id)
}

async function backToReadyToShip(container: MedusaContainer, subOrderId: string) {
  const marketplace: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)

  await marketplace.updateSubOrders({
    id: subOrderId,
    status: "ready_to_ship",
    carrier: null,
    tracking_number: null,
    shipped_at: null,
    shipping_fee: null,
    expected_delivery_at: null,
    carrier_status: "cancel",
  })
}

/**
 * GHN webhook: only moves a sub-order forward along the agreed flow. A status
 * that does not fit the sub-order's current state is recorded and ignored.
 */
export async function handleGhnStatus(
  container: MedusaContainer,
  payload: { OrderCode?: string; Status?: string; CODAmount?: number; TotalFee?: number }
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const marketplace: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
  const orderCode = payload.OrderCode
  const status = String(payload.Status ?? "").toLowerCase()

  if (!orderCode || !status) {
    return { handled: false, reason: "missing OrderCode/Status" }
  }

  const [subOrder] = await marketplace.listSubOrders({
    carrier: GHN_CARRIER,
    tracking_number: orderCode,
  })

  if (!subOrder) {
    logger.info(`[ghn] webhook for unknown order ${orderCode} (${status})`)
    return { handled: false, reason: "unknown order" }
  }

  await marketplace.updateSubOrders({
    id: subOrder.id,
    carrier_status: status,
    ...(payload.TotalFee ? { shipping_fee: Number(payload.TotalFee) } : {}),
  })

  const label = GHN_STATUS_LABELS[status] ?? status

  if (status === "delivered" && subOrder.status === "shipping") {
    await markDelivered(container, subOrder.id)
  } else if (status === "returned" && ["shipping", "delivered"].includes(subOrder.status)) {
    await cancelSubOrder(
      container,
      subOrder.id,
      "system",
      "Giao hàng không thành công, GHN đã trả hàng về nghệ nhân"
    )
  } else if (status === "cancel" && subOrder.status === "shipping") {
    await backToReadyToShip(container, subOrder.id)
    await notifyAdmin(
      container,
      `Vận đơn GHN ${orderCode} (đơn ${subOrder.code}) đã bị huỷ`,
      paragraph("Đơn con đã quay về trạng thái Chờ giao hàng. Vào Admin → Đơn sàn để tạo vận đơn mới.")
    )
  } else if (["delivery_fail", "exception", "damage", "lost", "return_fail"].includes(status)) {
    await notifyAdmin(
      container,
      `GHN báo "${label}" cho đơn ${subOrder.code}`,
      paragraph(
        `Vận đơn <a href="${ghnTrackingUrl(orderCode)}">${escapeHtml(orderCode)}</a>: ${escapeHtml(label)}. Vui lòng kiểm tra với GHN.`
      )
    )
  }

  return { handled: true, sub_order: subOrder.code, status: label }
}
