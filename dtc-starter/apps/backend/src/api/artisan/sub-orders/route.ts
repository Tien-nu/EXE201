import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"
import { subOrderForArtisan } from "../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import type MarketplaceModuleService from "../../../modules/marketplace/service"

/**
 * The artisan's sub-orders, optionally one status (`?status=`). Orders still
 * waiting on the customer's bank transfer are not shown yet.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const status = req.query.status as string | undefined

  const subOrders = await marketplace.listSubOrders(
    { artisan_id: artisan.id, ...(status ? { status: status as any } : {}) },
    {
      relations: ["items", "marketplace_order"],
      order: { created_at: "DESC" },
    }
  )

  const visible = subOrders.filter(
    (sub) =>
      sub.status !== "pending_payment" &&
      // Canceled before payment: the artisan never saw these.
      !(sub.status === "canceled" && !sub.accept_deadline && !sub.accepted_at)
  )

  const customIds = visible
    .map((sub) => sub.custom_request_id)
    .filter(Boolean) as string[]
  const customRequests = customIds.length
    ? await marketplace.listCustomRequests({ id: customIds })
    : []

  res.json({
    sub_orders: visible.map((sub) =>
      subOrderForArtisan(
        sub,
        customRequests.find((request) => request.id === sub.custom_request_id)
      )
    ),
  })
}
