import { model } from "@medusajs/framework/utils"
import SubOrder from "./sub-order"

export const PAYMENT_METHODS = ["cod", "bank_transfer"] as const

/**
 * - cod: nothing to collect up front, the carrier collects on delivery
 * - awaiting_transfer: bank transfer, the customer has 10 minutes to pay
 * - transfer_submitted: the customer says they paid, an admin has to check
 * - paid: an admin found the money on the statement
 * - expired: the 10 minutes ran out before the customer confirmed
 * - rejected: an admin could not find the money
 */
export const PAYMENT_STATUSES = [
  "cod",
  "awaiting_transfer",
  "transfer_submitted",
  "paid",
  "expired",
  "rejected",
] as const

/** Marketplace data for one Medusa order: how it is paid and its sub-orders. */
const MarketplaceOrder = model.define("marketplace_order", {
  id: model.id({ prefix: "mpo" }).primaryKey(),
  order_id: model.text().unique(),
  display_id: model.number(),
  customer_id: model.text().nullable(),
  email: model.text(),
  currency_code: model.text(),
  // Sum of the item totals; shipping is paid to the carrier on delivery.
  items_total: model.bigNumber(),
  payment_method: model.enum([...PAYMENT_METHODS]),
  payment_status: model.enum([...PAYMENT_STATUSES]),
  payment_deadline: model.dateTime().nullable(),
  transfer_submitted_at: model.dateTime().nullable(),
  paid_at: model.dateTime().nullable(),
  sub_orders: model.hasMany(() => SubOrder, { mappedBy: "marketplace_order" }),
})

export default MarketplaceOrder
