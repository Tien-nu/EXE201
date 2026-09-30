import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cancelGhnShipment } from "../../../../../../lib/marketplace/ghn-shipping"

/** Cancels a GHN order not picked up yet; the sub-order waits for a new one. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await cancelGhnShipment(req.scope, req.params.id)

  res.json({ success: true })
}
