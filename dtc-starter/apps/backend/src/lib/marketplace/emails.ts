import type { MedusaContainer } from "@medusajs/framework/types"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { STOREFRONT_URL } from "./constants"
import {
  escapeHtml,
  formatDate,
  formatDateTime,
  formatVnd,
} from "./format"
import { link, notifyAdmin, paragraph, sendEmail } from "./notify"

const ARTISAN_PORTAL_URL = `${STOREFRONT_URL}/kenh-nghe-nhan`

type Item = {
  title: string
  variant_title?: string | null
  quantity: number
  total: unknown
}

type Artisan = {
  id: string
  shop_name: string
  email: string
  phone?: string
  pickup_address?: string
}

export type FullSubOrder = {
  id: string
  code: string
  status: string
  lead_days?: number | null
  subtotal: unknown
  due_date?: Date | string | null
  accept_deadline?: Date | string | null
  carrier?: string | null
  tracking_number?: string | null
  shipping_fee?: unknown
  cancel_reason?: string | null
  refund_status?: string
  shipping_name?: string | null
  shipping_phone?: string | null
  shipping_address?: string | null
  items: Item[]
  artisan: Artisan
  marketplace_order: {
    id: string
    order_id: string
    display_id: number
    email: string
    payment_method: string
    payment_status: string
  }
}

const itemsTable = (items: Item[]) => `
<table style="width:100%;border-collapse:collapse;font-size:14px">
  ${items
    .map(
      (item) => `<tr>
    <td style="padding:6px 0;border-bottom:1px solid #eee">${item.quantity} × ${escapeHtml(item.title)}${
        item.variant_title ? ` <span style="color:#6b7280">(${escapeHtml(item.variant_title)})</span>` : ""
      }</td>
    <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatVnd(item.total)}</td>
  </tr>`
    )
    .join("")}
</table>`

const orderLink = (sub: FullSubOrder) =>
  link(`${STOREFRONT_URL}/account/orders/details/${sub.marketplace_order.order_id}`, "Xem đơn hàng")

export async function emailOrderPlaced(
  container: MedusaContainer,
  marketplaceOrderId: string
) {
  const marketplace: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId, {
    relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
  })

  const subOrders = order.sub_orders
    .map(
      (sub) =>
        `<h4 style="margin-bottom:4px">Đơn ${escapeHtml(sub.code)} – ${escapeHtml(sub.artisan.shop_name)}</h4>${itemsTable(sub.items as Item[])}`
    )
    .join("")

  const payment =
    order.payment_method === "bank_transfer"
      ? paragraph(
          `Bạn đã chọn <b>chuyển khoản</b>. Vui lòng chuyển <b>${formatVnd(order.items_total)}</b> trong vòng <b>10 phút</b> (trước ${formatDateTime(order.payment_deadline)}) và bấm "Tôi đã chuyển khoản" trên trang đơn hàng, nếu không đơn sẽ tự huỷ.`
        )
      : paragraph("Bạn đã chọn <b>thanh toán khi nhận hàng (COD)</b>.")

  await sendEmail(
    container,
    order.email,
    `Đặt hàng thành công – đơn #${order.display_id}`,
    paragraph(
      `Cảm ơn bạn đã đặt hàng tại Yarnly. Đơn của bạn được chia cho ${order.sub_orders.length} nghệ nhân, mỗi phần giao riêng.`
    ) +
      payment +
      subOrders +
      paragraph("Phí ship do đơn vị vận chuyển thu khi giao hàng.") +
      link(`${STOREFRONT_URL}/account/orders/details/${order.order_id}`, "Xem đơn hàng")
  )
}

export async function emailArtisanNewSubOrder(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  const action =
    sub.status === "processing"
      ? paragraph(
          `Đây là đơn <b>làm theo yêu cầu riêng</b> mà bạn đã đồng ý. Hạn hoàn thành: <b>${formatDate(sub.due_date)}</b>.`
        )
      : paragraph(
          `Vui lòng xác nhận nhận đơn trước <b>${formatDateTime(sub.accept_deadline)}</b> (12 tiếng). Quá hạn đơn sẽ tự huỷ.`
        )

  await sendEmail(
    container,
    sub.artisan.email,
    `Bạn có đơn hàng mới ${sub.code}`,
    action +
      itemsTable(sub.items) +
      paragraph(`Tổng tiền hàng: <b>${formatVnd(sub.subtotal)}</b>`) +
      link(`${ARTISAN_PORTAL_URL}/don-hang/${sub.id}`, "Mở đơn hàng")
  )
}

export async function emailPaymentConfirmed(
  container: MedusaContainer,
  order: { email: string; display_id: number; order_id: string }
) {
  await sendEmail(
    container,
    order.email,
    `Đã nhận tiền chuyển khoản – đơn #${order.display_id}`,
    paragraph(
      "Yarnly đã nhận được tiền chuyển khoản của bạn. Đơn hàng đã được gửi tới các nghệ nhân."
    ) + link(`${STOREFRONT_URL}/account/orders/details/${order.order_id}`, "Xem đơn hàng")
  )
}

export async function emailTransferSubmitted(
  container: MedusaContainer,
  order: { display_id: number; email: string; items_total: unknown }
) {
  await notifyAdmin(
    container,
    `Khách báo đã chuyển khoản – đơn #${order.display_id}`,
    paragraph(
      `Khách ${escapeHtml(order.email)} báo đã chuyển <b>${formatVnd(order.items_total)}</b> cho đơn #${order.display_id} (nội dung "YARNLY ${order.display_id}"). Vui lòng kiểm tra sao kê và xác nhận trong trang Admin → Đơn sàn.`
    )
  )
}

export async function emailSubOrderAccepted(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  const due = sub.due_date
    ? `Nghệ nhân sẽ làm xong trước <b>${formatDate(sub.due_date)}</b>.`
    : "Nghệ nhân đang chuẩn bị hàng để giao."

  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Nghệ nhân đã nhận đơn ${sub.code}`,
    paragraph(`${escapeHtml(sub.artisan.shop_name)} đã nhận đơn ${sub.code}. ${due}`) +
      orderLink(sub)
  )
}

export async function emailSubOrderCanceled(
  container: MedusaContainer,
  sub: FullSubOrder,
  notifyArtisan: boolean
) {
  const refund =
    sub.refund_status === "pending"
      ? paragraph(
          `Số tiền <b>${formatVnd(sub.subtotal)}</b> bạn đã chuyển khoản sẽ được Yarnly hoàn lại vào tài khoản đã chuyển.`
        )
      : ""

  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Đơn ${sub.code} đã bị huỷ`,
    paragraph(`Lý do: ${escapeHtml(sub.cancel_reason)}`) +
      itemsTable(sub.items) +
      refund +
      orderLink(sub)
  )

  if (notifyArtisan) {
    await sendEmail(
      container,
      sub.artisan.email,
      `Đơn ${sub.code} đã bị huỷ`,
      paragraph(`Lý do: ${escapeHtml(sub.cancel_reason)}`) + itemsTable(sub.items)
    )
  }

  if (sub.refund_status === "pending") {
    await notifyAdmin(
      container,
      `Cần hoàn tiền đơn ${sub.code}`,
      paragraph(
        `Đơn ${sub.code} (khách ${escapeHtml(sub.marketplace_order.email)}) đã huỷ sau khi khách chuyển khoản. Cần hoàn <b>${formatVnd(sub.subtotal)}</b>, sau đó bấm "Đã hoàn tiền" trong Admin → Đơn sàn.`
      )
    )
  }
}

export async function emailReadyToShip(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  await notifyAdmin(
    container,
    `Đơn ${sub.code} đã làm xong – cần tạo đơn vận chuyển`,
    paragraph(`Nghệ nhân <b>${escapeHtml(sub.artisan.shop_name)}</b> đã làm xong đơn ${sub.code}.`) +
      `<h4>Lấy hàng tại</h4>` +
      paragraph(
        `${escapeHtml(sub.artisan.shop_name)} – ${escapeHtml(sub.artisan.phone)}<br/>${escapeHtml(sub.artisan.pickup_address)}`
      ) +
      `<h4>Giao tới</h4>` +
      paragraph(
        `${escapeHtml(sub.shipping_name)} – ${escapeHtml(sub.shipping_phone)}<br/>${escapeHtml(sub.shipping_address)}`
      ) +
      `<h4>Hàng</h4>` +
      itemsTable(sub.items) +
      paragraph(
        sub.marketplace_order.payment_method === "cod"
          ? `Thu hộ COD: <b>${formatVnd(sub.subtotal)}</b> + phí ship.`
          : "Khách đã chuyển khoản tiền hàng, chỉ thu phí ship."
      )
  )
}

export async function emailShipping(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  const tracking =
    sub.carrier === "GHN" && sub.tracking_number
      ? ` – <a href="https://donhang.ghn.vn/?order_code=${encodeURIComponent(sub.tracking_number)}">tra cứu</a>`
      : ""
  const fee = sub.shipping_fee
    ? `Phí ship <b>${formatVnd(sub.shipping_fee)}</b> trả cho shipper khi nhận hàng.`
    : "Phí ship sẽ do đơn vị vận chuyển thu khi giao hàng."
  const cod =
    sub.marketplace_order.payment_method === "cod"
      ? ` Shipper thu thêm tiền hàng <b>${formatVnd(sub.subtotal)}</b> (COD).`
      : ""

  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Đơn ${sub.code} đang được giao`,
    paragraph(
      `Đơn vị vận chuyển: <b>${escapeHtml(sub.carrier)}</b><br/>Mã vận đơn: <b>${escapeHtml(sub.tracking_number)}</b>${tracking}`
    ) +
      paragraph(fee + cod) +
      orderLink(sub)
  )
}

export async function emailDelivered(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Đơn ${sub.code} đã giao thành công`,
    paragraph(
      "Đơn hàng đã được giao. Đơn sẽ tự động hoàn thành sau 2 ngày."
    ) + orderLink(sub)
  )
}

export async function emailCompleted(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Đơn ${sub.code} đã hoàn thành`,
    paragraph("Cảm ơn bạn đã mua đồ handmade tại Yarnly!") + orderLink(sub)
  )
  await sendEmail(
    container,
    sub.artisan.email,
    `Đơn ${sub.code} đã hoàn thành`,
    paragraph(
      `Đơn ${sub.code} đã hoàn thành. <b>${formatVnd(sub.subtotal)}</b> sẽ được tính vào kỳ chuyển tiền thứ Hai tới.`
    )
  )
}

export async function emailRefunded(
  container: MedusaContainer,
  sub: FullSubOrder
) {
  await sendEmail(
    container,
    sub.marketplace_order.email,
    `Đã hoàn tiền đơn ${sub.code}`,
    paragraph(
      `Yarnly đã hoàn <b>${formatVnd(sub.subtotal)}</b> cho đơn ${sub.code} vào tài khoản bạn đã chuyển.`
    )
  )
}
