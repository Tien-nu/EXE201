import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { CreateArtisanProductBody } from "../../marketplace-validators"
import {
  createArtisanProduct,
  listArtisanProducts,
} from "../../../lib/marketplace/artisan-products"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)

  res.json({ products: await listArtisanProducts(req.scope, artisan.id) })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateArtisanProductBody>,
  res: MedusaResponse
) {
  const artisan = await getAuthedArtisan(req)
  const product = await createArtisanProduct(req.scope, artisan.id, req.validatedBody)

  res.json({ product })
}
