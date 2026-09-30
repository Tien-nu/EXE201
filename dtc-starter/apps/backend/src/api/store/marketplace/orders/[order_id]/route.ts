import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { HOUR } from "../../../../../lib/marketplace/constants"
import { ensureMarketplaceOrder } from "../../../../../lib/marketplace/orders"
import { marketplaceOrderForCustomer } from "../../../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../../modules/marketplace/service"

const notFound = () =>
  new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng")

/**
 * One order's marketplace data, by Medusa order id. The confirmation page can
 * load before the `order.placed` subscriber ran, so a fresh order is split
 * here if needed.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id
  const orderId = req.params.order_id

  let [order] = await marketplace.listMarketplaceOrders({ order_id: orderId })

  if (!order) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [medusaOrder],
    } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id", "created_at"],
      filters: { id: orderId },
    })

    const isFresh =
      !!medusaOrder &&
      Date.now() - new Date(medusaOrder.created_at as string).getTime() < HOUR

    if (!medusaOrder || medusaOrder.customer_id !== customerId || !isFresh) {
      throw notFound()
    }

    order = (await ensureMarketplaceOrder(req.scope, orderId)).marketplaceOrder
  }

  if (order.customer_id !== customerId) {
    throw notFound()
  }

  const full = await marketplace.retrieveMarketplaceOrder(order.id, {
    relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
  })

  res.json({
    order: marketplaceOrderForCustomer(full, await marketplace.getSettings()),
  })
}
