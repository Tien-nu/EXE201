import { model } from "@medusajs/framework/utils"
import Artisan from "./artisan"

/**
 * - pending: waiting for the artisan
 * - quoted: the artisan offered a price and a making time
 * - artisan_declined / customer_declined: one side said no, it ends here
 * - accepted: the customer took the offer, the item is in their cart
 * - ordered: the customer placed an order with it
 */
export const CUSTOM_REQUEST_STATUSES = [
  "pending",
  "quoted",
  "artisan_declined",
  "accepted",
  "customer_declined",
  "ordered",
] as const

const CustomRequest = model.define("custom_request", {
  id: model.id({ prefix: "creq" }).primaryKey(),
  customer_id: model.text(),
  customer_email: model.text(),
  customer_name: model.text().nullable(),
  product_id: model.text(),
  variant_id: model.text(),
  product_title: model.text(),
  thumbnail: model.text().nullable(),
  description: model.text(),
  color: model.text().nullable(),
  size: model.text().nullable(),
  quantity: model.number().default(1),
  status: model.enum([...CUSTOM_REQUEST_STATUSES]).default("pending"),
  quoted_price: model.bigNumber().nullable(),
  quoted_lead_days: model.number().nullable(),
  artisan_note: model.text().nullable(),
  responded_at: model.dateTime().nullable(),
  decided_at: model.dateTime().nullable(),
  order_id: model.text().nullable(),
  artisan: model.belongsTo(() => Artisan, { mappedBy: "custom_requests" }),
})

export default CustomRequest
