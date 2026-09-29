import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import type MarketplaceModuleService from "../../../modules/marketplace/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const payouts = await marketplace.listPayouts(
    { artisan_id: artisan.id },
    { order: { created_at: "DESC" } }
  )

  res.json({ payouts })
}
