import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"
import { toNumber } from "../../../lib/marketplace/numbers"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import type MarketplaceModuleService from "../../../modules/marketplace/service"

/** Counters for the portal home page. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const [subOrders, pendingRequests, payouts] = await Promise.all([
    marketplace.listSubOrders({ artisan_id: artisan.id }),
    marketplace.listCustomRequests({ artisan_id: artisan.id, status: "pending" }),
    marketplace.listPayouts({ artisan_id: artisan.id }),
  ])

  const byStatus: Record<string, number> = {}

  for (const subOrder of subOrders) {
    byStatus[subOrder.status] = (byStatus[subOrder.status] ?? 0) + 1
  }

  const completed = subOrders.filter((sub) => sub.status === "completed")

  res.json({
    sub_orders_by_status: byStatus,
    pending_custom_requests: pendingRequests.length,
    revenue: {
      completed_total: completed.reduce((sum, sub) => sum + toNumber(sub.subtotal), 0),
      awaiting_payout: completed
        .filter((sub) => !sub.payout_id)
        .reduce((sum, sub) => sum + toNumber(sub.subtotal), 0),
      pending_payout: payouts
        .filter((payout) => payout.status === "pending")
        .reduce((sum, payout) => sum + toNumber(payout.net_amount), 0),
      paid_out: payouts
        .filter((payout) => payout.status === "paid")
        .reduce((sum, payout) => sum + toNumber(payout.net_amount), 0),
    },
  })
}
