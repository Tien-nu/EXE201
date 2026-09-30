import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  cancelOverdueAcceptances,
  completeDeliveredSubOrders,
  expireUnpaidOrders,
} from "../lib/marketplace/transitions"

/**
 * Every minute: cancels bank transfers not paid within 10 minutes and
 * sub-orders not accepted within 12 hours, and completes sub-orders 2 days
 * after delivery.
 */
export default async function marketplaceTimers(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  for (const [name, run] of [
    ["expire unpaid transfers", expireUnpaidOrders],
    ["cancel unaccepted sub-orders", cancelOverdueAcceptances],
    ["complete delivered sub-orders", completeDeliveredSubOrders],
  ] as const) {
    try {
      const count = await run(container)

      if (count) {
        logger.info(`[marketplace] ${name}: ${count}`)
      }
    } catch (error) {
      logger.error(`[marketplace] ${name} failed: ${(error as Error).message}`)
    }
  }
}

export const config = {
  name: "marketplace-timers",
  schedule: "* * * * *",
}
