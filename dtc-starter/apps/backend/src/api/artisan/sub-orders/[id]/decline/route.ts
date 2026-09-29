import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ReasonBody } from "../../../../marketplace-validators"
import { getAuthedArtisan } from "../../../../../lib/marketplace/artisans"
import { declineSubOrder } from "../../../../../lib/marketplace/transitions"

export async function POST(
  req: AuthenticatedMedusaRequest<ReasonBody>,
  res: MedusaResponse
) {
  const artisan = await getAuthedArtisan(req)
  await declineSubOrder(req.scope, req.params.id, artisan.id, req.validatedBody.reason)

  res.json({ success: true })
}
