import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ArtisanProfileUpdateBody } from "../../marketplace-validators"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import type MarketplaceModuleService from "../../../modules/marketplace/service"

/** The artisan's own account, readable in any status (e.g. while pending). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req, { requireActive: false })

  res.json({ artisan })
}

export async function POST(
  req: AuthenticatedMedusaRequest<ArtisanProfileUpdateBody>,
  res: MedusaResponse
) {
  const artisan = await getAuthedArtisan(req, { requireActive: false })
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const updated = await marketplace.updateArtisans({
    id: artisan.id,
    ...req.validatedBody,
  })

  res.json({ artisan: updated })
}
