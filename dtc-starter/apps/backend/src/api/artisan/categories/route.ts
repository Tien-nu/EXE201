import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"

/** Categories an artisan can file products under. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await getAuthedArtisan(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: { is_active: true },
  })

  res.json({ categories: data })
}
