import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { DecideCustomRequestBody } from "../../../../../marketplace-validators"
import { decideCustomRequest } from "../../../../../../lib/marketplace/custom-requests"

/** Accept (puts it in the cart at the quoted price) or decline the quote. */
export async function POST(
  req: AuthenticatedMedusaRequest<DecideCustomRequestBody>,
  res: MedusaResponse
) {
  const request = await decideCustomRequest(
    req.scope,
    req.auth_context.actor_id,
    req.params.id,
    req.validatedBody
  )

  res.json({ custom_request: request })
}
