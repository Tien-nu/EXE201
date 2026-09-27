import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

/** Marketplace orders, e.g. `?payment_status=transfer_submitted` to check the bank. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const paymentStatus = req.query.payment_status as string | string[] | undefined

  const orders = await marketplace.listMarketplaceOrders(
    paymentStatus ? { payment_status: paymentStatus as any } : {},
    {
      relations: ["sub_orders", "sub_orders.artisan"],
      order: { created_at: "DESC" },
      take: 200,
    }
  )

  res.json({ orders })
}
