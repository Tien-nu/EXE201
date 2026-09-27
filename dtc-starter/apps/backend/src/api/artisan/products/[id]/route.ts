import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { UpdateArtisanProductBody } from "../../../marketplace-validators"
import {
  deleteArtisanProduct,
  getArtisanProduct,
  updateArtisanProduct,
} from "../../../../lib/marketplace/artisan-products"
import { getAuthedArtisan } from "../../../../lib/marketplace/artisans"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)

  res.json({
    product: await getArtisanProduct(req.scope, artisan.id, req.params.id),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateArtisanProductBody>,
  res: MedusaResponse
) {
  const artisan = await getAuthedArtisan(req)
  const product = await updateArtisanProduct(
    req.scope,
    artisan.id,
    req.params.id,
    req.validatedBody
  )

  res.json({ product })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  await deleteArtisanProduct(req.scope, artisan.id, req.params.id)

  res.json({ id: req.params.id, deleted: true })
}
