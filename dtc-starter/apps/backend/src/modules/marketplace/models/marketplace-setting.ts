import { model } from "@medusajs/framework/utils"

/** Single row of platform settings the admin can change. */
const MarketplaceSetting = model.define("marketplace_setting", {
  id: model.id({ prefix: "mpset" }).primaryKey(),
  platform_fee_percent: model.float().default(0),
  // Gmail that receives "ready to ship" and other admin emails.
  admin_email: model.text().nullable(),
  // Yarnly's receiving account, used for the VietQR code.
  bank_name: model.text().nullable(),
  // VietQR bank id: a short name such as "mb" or the bank BIN.
  bank_code: model.text().nullable(),
  bank_account_number: model.text().nullable(),
  bank_account_name: model.text().nullable(),
})

export default MarketplaceSetting
