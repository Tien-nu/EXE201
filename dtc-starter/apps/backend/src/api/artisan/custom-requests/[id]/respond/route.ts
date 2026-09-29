import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { RespondCustomRequestBody } from "../../../../marketplace-validators"
import { getAuthedArtisan } from "../../../../../lib/marketplace/artisans"
import { respondToCustomRequest } from "../../../../../lib/marketplace/custom-requests"
import { customRequestForArtisan } from "../../../../../lib/marketplace/serialize"

/** One-time answer: a price and making time, or a refusal. */
export async function POST(
  req: AuthenticatedMedusaRequest<RespondCustomRequestBody>,
  res: MedusaResponse
) {
  const artisan = await getAuthedArtisan(req)
  const request = await respondToCustomRequest(
    req.scope,
    artisan.id,
    req.params.id,
    req.validatedBody
  )

  res.json({ custom_request: customRequestForArtisan(request) })
}
