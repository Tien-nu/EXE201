import { model } from "@medusajs/framework/utils"
import Artisan from "./artisan"
import MarketplaceOrder from "./marketplace-order"
import SubOrderItem from "./sub-order-item"

export const SUB_ORDER_STATUSES = [
  "pending_payment",
  "pending_acceptance",
  "processing",
  "ready_to_ship",
  "shipping",
  "delivered",
  "completed",
  "canceled",
] as const

export const CANCELED_BY = ["customer", "artisan", "system", "admin"] as const

export const REFUND_STATUSES = ["not_required", "pending", "refunded"] as const

/** The part of an order one artisan makes and ships. */
const SubOrder = model.define("sub_order", {
  id: model.id({ prefix: "subo" }).primaryKey(),
  // Human readable, e.g. "#12-2": second sub-order of order #12.
  code: model.text(),
  status: model.enum([...SUB_ORDER_STATUSES]),
  is_custom: model.boolean().default(false),
  custom_request_id: model.text().nullable(),
  made_to_order: model.boolean().default(false),
  // Longest making time among the items, in days.
  lead_days: model.number().nullable(),
  subtotal: model.bigNumber(),
  shipping_name: model.text().nullable(),
  shipping_phone: model.text().nullable(),
  shipping_address: model.text().nullable(),
  accept_deadline: model.dateTime().nullable(),
  accepted_at: model.dateTime().nullable(),
  due_date: model.dateTime().nullable(),
  ready_at: model.dateTime().nullable(),
  carrier: model.text().nullable(),
  tracking_number: model.text().nullable(),
  // What the carrier charges the customer on delivery, when known (GHN).
  shipping_fee: model.bigNumber().nullable(),
  expected_delivery_at: model.dateTime().nullable(),
  // Last status reported by the carrier's webhook, e.g. "delivering".
  carrier_status: model.text().nullable(),
  shipped_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
  // When the order completes by itself, 2 days after delivery.
  complete_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  canceled_at: model.dateTime().nullable(),
  canceled_by: model.enum([...CANCELED_BY]).nullable(),
  cancel_reason: model.text().nullable(),
  refund_status: model.enum([...REFUND_STATUSES]).default("not_required"),
  refunded_at: model.dateTime().nullable(),
  payout_id: model.text().nullable(),
  artisan: model.belongsTo(() => Artisan, { mappedBy: "sub_orders" }),
  marketplace_order: model.belongsTo(() => MarketplaceOrder, {
    mappedBy: "sub_orders",
  }),
  items: model.hasMany(() => SubOrderItem, { mappedBy: "sub_order" }),
})

export default SubOrder
