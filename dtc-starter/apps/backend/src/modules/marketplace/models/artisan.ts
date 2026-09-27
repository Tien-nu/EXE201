import { model } from "@medusajs/framework/utils"
import CustomRequest from "./custom-request"
import Payout from "./payout"
import SubOrder from "./sub-order"

export const ARTISAN_STATUSES = ["pending", "active", "rejected", "locked"] as const

const Artisan = model.define("artisan", {
  id: model.id({ prefix: "art" }).primaryKey(),
  handle: model.text().unique(),
  shop_name: model.text().searchable(),
  full_name: model.text(),
  email: model.text().unique(),
  phone: model.text(),
  description: model.text().nullable(),
  avatar_url: model.text().nullable(),
  // Where the carrier picks the parcels up.
  pickup_address: model.text(),
  bank_name: model.text(),
  bank_account_number: model.text(),
  bank_account_name: model.text(),
  status: model.enum([...ARTISAN_STATUSES]).default("pending"),
  // Why the account was rejected or locked, shown to the artisan.
  status_reason: model.text().nullable(),
  sub_orders: model.hasMany(() => SubOrder, { mappedBy: "artisan" }),
  custom_requests: model.hasMany(() => CustomRequest, { mappedBy: "artisan" }),
  payouts: model.hasMany(() => Payout, { mappedBy: "artisan" }),
})

export default Artisan
