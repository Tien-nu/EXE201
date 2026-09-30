import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { SettingsBody } from "../../../marketplace-validators"
import { isGhnConfigured } from "../../../../lib/marketplace/ghn"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  res.json({
    settings: await marketplace.getSettings(),
    ghn_enabled: isGhnConfigured(),
  })
}

/** Platform fee (0% for now), admin Gmail and Yarnly's receiving account. */
export async function POST(req: MedusaRequest<SettingsBody>, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const settings = await marketplace.getSettings()
  const { admin_email, ...rest } = req.validatedBody

  const updated = await marketplace.updateMarketplaceSettings({
    id: settings.id,
    ...rest,
    admin_email: admin_email || null,
  })

  res.json({ settings: updated })
}
