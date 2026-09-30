import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { marketplaceOrderForCustomer } from "../../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

/** The customer's orders with their sub-orders. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const orders = await marketplace.listMarketplaceOrders(
    { customer_id: req.auth_context.actor_id },
    {
      relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
      order: { created_at: "DESC" },
    }
  )

  res.json({ orders: orders.map((order) => marketplaceOrderForCustomer(order)) })
}
