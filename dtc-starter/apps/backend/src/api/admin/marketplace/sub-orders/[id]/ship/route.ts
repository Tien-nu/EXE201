import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ShipBody } from "../../../../../marketplace-validators"
import { shipSubOrder } from "../../../../../../lib/marketplace/transitions"

/** The admin booked the carrier: record carrier and tracking number. */
export async function POST(req: MedusaRequest<ShipBody>, res: MedusaResponse) {
  await shipSubOrder(req.scope, req.params.id, req.validatedBody)

  res.json({ success: true })
}
