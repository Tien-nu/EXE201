import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { publicArtisan } from "../../../../../lib/marketplace/serialize"

/** Who makes a product and how it is made, for the product page. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "metadata", "artisan.*"],
    filters: { id: req.params.id },
  })
  const artisan = (product as any)?.artisan
  const metadata = (product?.metadata ?? {}) as Record<string, unknown>

  res.json({
    artisan: artisan?.status === "active" ? publicArtisan(artisan) : null,
    fulfillment_type:
      metadata.fulfillment_type === "made_to_order" ? "made_to_order" : "ready",
    lead_days: metadata.lead_days ? Number(metadata.lead_days) : null,
  })
}
