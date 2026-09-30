import { model } from "@medusajs/framework/utils"
import Artisan from "./artisan"

export const PAYOUT_STATUSES = ["pending", "paid"] as const

/** One Monday transfer from Yarnly to an artisan. */
const Payout = model.define("payout", {
  id: model.id({ prefix: "pay" }).primaryKey(),
  period_start: model.dateTime(),
  period_end: model.dateTime(),
  sub_order_count: model.number(),
  gross_amount: model.bigNumber(),
  fee_percent: model.float(),
  fee_amount: model.bigNumber(),
  net_amount: model.bigNumber(),
  // Bank details at the time the payout was made.
  bank_name: model.text(),
  bank_account_number: model.text(),
  bank_account_name: model.text(),
  status: model.enum([...PAYOUT_STATUSES]).default("pending"),
  transaction_ref: model.text().nullable(),
  paid_at: model.dateTime().nullable(),
  artisan: model.belongsTo(() => Artisan, { mappedBy: "payouts" }),
})

export default Payout
