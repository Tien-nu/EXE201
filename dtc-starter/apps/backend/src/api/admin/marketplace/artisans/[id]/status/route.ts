import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ArtisanStatusBody } from "../../../../../marketplace-validators"
import { setArtisanStatus } from "../../../../../../lib/marketplace/artisans"

/** Approve (active), reject, lock, or unlock (active again) a shop. */
export async function POST(
  req: MedusaRequest<ArtisanStatusBody>,
  res: MedusaResponse
) {
  const artisan = await setArtisanStatus(
    req.scope,
    req.params.id,
    req.validatedBody.status,
    req.validatedBody.reason
  )

  res.json({ artisan })
}
