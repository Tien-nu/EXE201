import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { OptionalReasonBody } from "../../../../../marketplace-validators"
import { rejectPayment } from "../../../../../../lib/marketplace/transitions"

/** The money never arrived: cancel the order. */
export async function POST(
  req: MedusaRequest<OptionalReasonBody>,
  res: MedusaResponse
) {
  await rejectPayment(req.scope, req.params.id, req.validatedBody.reason ?? undefined)

  res.json({ success: true })
}
