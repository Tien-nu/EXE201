import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generatePayouts } from "../../../../lib/marketplace/payouts"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const payouts = await marketplace.listPayouts(
    {},
    { relations: ["artisan"], order: { created_at: "DESC" }, take: 200 }
  )

  res.json({ payouts })
}

/** "Tổng hợp tuần trước": the same thing the Monday job does. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payouts = await generatePayouts(req.scope)

  res.json({ created: payouts.length })
}
