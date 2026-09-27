import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { markDelivered } from "../../../../../../lib/marketplace/transitions"

/** Delivered: the order completes by itself 2 days later. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await markDelivered(req.scope, req.params.id)

  res.json({ success: true })
}
