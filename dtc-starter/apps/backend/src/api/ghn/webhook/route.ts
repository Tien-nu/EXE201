import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { handleGhnStatus } from "../../../lib/marketplace/ghn-shipping"

/**
 * Status callback from GHN. Register it in the GHN dashboard as
 *   https://<backend-domain>/ghn/webhook?token=<GHN_WEBHOOK_TOKEN>
 * GHN does not sign its requests, so the shared token is what keeps anyone
 * else from marking orders delivered.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const expected = process.env.GHN_WEBHOOK_TOKEN

  if (!expected) {
    logger.warn("[ghn] webhook rejected: GHN_WEBHOOK_TOKEN is not set")
    return res.status(401).json({ success: false, message: "Webhook is not configured" })
  }

  if (req.query.token !== expected) {
    return res.status(401).json({ success: false, message: "Invalid token" })
  }

  try {
    const result = await handleGhnStatus(req.scope, req.body as Record<string, any>)
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    logger.error(`[ghn] webhook failed: ${(error as Error).message}`)
    // 5xx makes GHN retry later.
    res.status(500).json({ success: false, message: (error as Error).message })
  }
}
