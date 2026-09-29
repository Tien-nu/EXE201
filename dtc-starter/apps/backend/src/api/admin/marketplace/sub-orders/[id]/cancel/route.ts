import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ReasonBody } from "../../../../../marketplace-validators"
import { cancelSubOrder } from "../../../../../../lib/marketplace/transitions"

export async function POST(req: MedusaRequest<ReasonBody>, res: MedusaResponse) {
  await cancelSubOrder(req.scope, req.params.id, "admin", req.validatedBody.reason)

  res.json({ success: true })
}
