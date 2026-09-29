import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

/** Sub-orders by `?status=` and/or `?refund_status=pending`. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const { status, refund_status } = req.query as Record<string, string | undefined>

  const subOrders = await marketplace.listSubOrders(
    {
      ...(status ? { status: status as any } : {}),
      ...(refund_status ? { refund_status: refund_status as any } : {}),
    },
    {
      relations: ["items", "artisan", "marketplace_order"],
      order: { created_at: "DESC" },
      take: 200,
    }
  )

  res.json({ sub_orders: subOrders })
}
