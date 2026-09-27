import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { markRefunded } from "../../../../../../lib/marketplace/transitions"

/** The admin transferred the money back to the customer. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await markRefunded(req.scope, req.params.id)

  res.json({ success: true })
}
