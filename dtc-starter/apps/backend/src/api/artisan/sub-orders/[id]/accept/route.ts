import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAuthedArtisan } from "../../../../../lib/marketplace/artisans"
import { acceptSubOrder } from "../../../../../lib/marketplace/transitions"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  await acceptSubOrder(req.scope, req.params.id, artisan.id)

  res.json({ success: true })
}
