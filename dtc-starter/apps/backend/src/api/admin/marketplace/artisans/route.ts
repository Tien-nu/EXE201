import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { AdminCreateArtisanBody } from "../../../marketplace-validators"
import { createArtisanByAdmin } from "../../../../lib/marketplace/artisans"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const status = req.query.status as string | undefined

  const artisans = await marketplace.listArtisans(
    status ? { status: status as any } : {},
    { order: { created_at: "DESC" } }
  )

  res.json({ artisans })
}

export async function POST(
  req: MedusaRequest<AdminCreateArtisanBody>,
  res: MedusaResponse
) {
  const artisan = await createArtisanByAdmin(req.scope, req.validatedBody)

  res.json({ artisan })
}
