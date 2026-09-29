import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { emailArtisanNewSubOrder, emailOrderPlaced } from "../lib/marketplace/emails"
import { ensureMarketplaceOrder } from "../lib/marketplace/orders"
import { getFullSubOrder } from "../lib/marketplace/transitions"
import { MARKETPLACE_MODULE } from "../modules/marketplace"
import type MarketplaceModuleService from "../modules/marketplace/service"

/** Splits every new order into sub-orders per artisan and sends the emails. */
export default async function marketplaceOrderPlaced({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const marketplace: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  try {
    const { marketplaceOrder, created } = await ensureMarketplaceOrder(
      container,
      data.id
    )

    if (!created) {
      return
    }

    await emailOrderPlaced(container, marketplaceOrder.id)

    // COD sub-orders reach the artisans right away; bank transfers wait.
    const started = await marketplace.listSubOrders({
      marketplace_order_id: marketplaceOrder.id,
      status: ["pending_acceptance", "processing"],
    })

    for (const subOrder of started) {
      await emailArtisanNewSubOrder(
        container,
        await getFullSubOrder(container, subOrder.id)
      )
    }
  } catch (error) {
    logger.error(
      `Could not create marketplace sub-orders for order ${data.id}: ${(error as Error).message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
