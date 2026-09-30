import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { notifyAdmin, paragraph } from "../lib/marketplace/notify"
import { generatePayouts } from "../lib/marketplace/payouts"

/**
 * Monday 07:00 in Vietnam (00:00 UTC): drafts last week's payouts so the admin
 * only has to transfer the money and mark each one paid.
 */
export default async function marketplaceWeeklyPayouts(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const payouts = await generatePayouts(container)

  logger.info(`[marketplace] weekly payouts drafted: ${payouts.length}`)

  if (payouts.length) {
    await notifyAdmin(
      container,
      `Có ${payouts.length} khoản cần chuyển cho nghệ nhân tuần này`,
      paragraph("Vào Admin → Đối soát để chuyển tiền và đánh dấu đã chuyển.")
    )
  }
}

export const config = {
  name: "marketplace-weekly-payouts",
  schedule: "0 0 * * 1",
}
