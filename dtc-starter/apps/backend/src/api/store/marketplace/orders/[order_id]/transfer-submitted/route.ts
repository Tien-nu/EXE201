import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { submitTransfer } from "../../../../../../lib/marketplace/transitions"
import { MARKETPLACE_MODULE } from "../../../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../../../modules/marketplace/service"

/** The customer pressed "Tôi đã chuyển khoản". */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const [order] = await marketplace.listMarketplaceOrders({
    order_id: req.params.order_id,
    customer_id: req.auth_context.actor_id,
  })

  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng")
  }

  await submitTransfer(req.scope, order.id)

  res.json({ success: true })
}
