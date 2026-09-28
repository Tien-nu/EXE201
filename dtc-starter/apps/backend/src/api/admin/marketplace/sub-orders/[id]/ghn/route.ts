import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createGhnShipment } from "../../../../../../lib/marketplace/ghn-shipping"

/** Books a real GHN pickup at the artisan and marks the sub-order shipping. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const created = await createGhnShipment(req.scope, req.params.id)

  res.json({ order_code: created.order_code, total_fee: created.total_fee })
}
