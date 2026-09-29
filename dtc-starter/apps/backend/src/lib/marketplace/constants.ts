/** Minutes a customer has to make the bank transfer. */
export const PAYMENT_WINDOW_MINUTES = 10

/** Hours an artisan has to accept a new sub-order. */
export const ACCEPT_WINDOW_HOURS = 12

/** Days after delivery before a sub-order completes by itself. */
export const AUTO_COMPLETE_DAYS = 2

/** Vietnam has no daylight saving time, so UTC+7 all year. */
export const VN_UTC_OFFSET_HOURS = 7

/** Artisan every product without an owner falls back to. */
export const HOUSE_ARTISAN_HANDLE = "yarnly"

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export const STOREFRONT_URL =
  process.env.STOREFRONT_URL || "http://localhost:8000/vn"

export const SUB_ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  pending_acceptance: "Chờ nghệ nhân xác nhận",
  processing: "Đang làm / chuẩn bị",
  ready_to_ship: "Đã làm xong – chờ giao hàng",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  canceled: "Đã huỷ",
}

export const FULFILLMENT_TYPES = ["ready", "made_to_order"] as const
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number]
