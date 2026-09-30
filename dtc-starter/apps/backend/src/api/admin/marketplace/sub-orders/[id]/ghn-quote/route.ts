import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { quoteGhnShipment } from "../../../../../../lib/marketplace/ghn-shipping"

/** GHN fee and delivery date for this sub-order; books nothing. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.json({ quote: await quoteGhnShipment(req.scope, req.params.id) })
}
