import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { PayoutPaidBody } from "../../../../../marketplace-validators"
import { markPayoutPaid } from "../../../../../../lib/marketplace/payouts"

export async function POST(req: MedusaRequest<PayoutPaidBody>, res: MedusaResponse) {
  const payout = await markPayoutPaid(
    req.scope,
    req.params.id,
    req.validatedBody.transaction_ref
  )

  res.json({ payout })
}
