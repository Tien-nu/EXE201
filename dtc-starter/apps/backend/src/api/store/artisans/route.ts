import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { publicArtisan } from "../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import type MarketplaceModuleService from "../../../modules/marketplace/service"

/** Active shops, for the "Nghệ nhân" listing. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const artisans = await marketplace.listArtisans(
    { status: "active" },
    { order: { shop_name: "ASC" } }
  )

  res.json({ artisans: artisans.map(publicArtisan) })
}
