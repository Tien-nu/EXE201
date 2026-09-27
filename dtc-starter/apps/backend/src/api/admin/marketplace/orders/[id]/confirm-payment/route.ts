import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { confirmPayment } from "../../../../../../lib/marketplace/transitions"

/** The transfer is on the bank statement: send the order to the artisans. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await confirmPayment(req.scope, req.params.id)

  res.json({ success: true })
}
