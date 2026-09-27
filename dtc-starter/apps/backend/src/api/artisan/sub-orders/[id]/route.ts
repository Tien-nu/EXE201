import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { getAuthedArtisan } from "../../../../lib/marketplace/artisans"
import { subOrderForArtisan } from "../../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const [subOrder] = await marketplace.listSubOrders(
    { id: req.params.id, artisan_id: artisan.id },
    { relations: ["items", "marketplace_order"] }
  )

  if (!subOrder || subOrder.status === "pending_payment") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng")
  }

  const customRequest = subOrder.custom_request_id
    ? await marketplace.retrieveCustomRequest(subOrder.custom_request_id)
    : undefined

  res.json({ sub_order: subOrderForArtisan(subOrder, customRequest) })
}
