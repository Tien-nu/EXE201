import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAuthedArtisan } from "../../../../../lib/marketplace/artisans"
import { markReadyToShip } from "../../../../../lib/marketplace/transitions"

/** "Đã làm xong – chờ giao hàng": emails the admin to book the carrier. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const artisan = await getAuthedArtisan(req)
  await markReadyToShip(req.scope, req.params.id, artisan.id)

  res.json({ success: true })
}
