import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { publicArtisan } from "../../../../lib/marketplace/serialize"

/** A shop and the ids of its published products; prices come from /store/products. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [artisan],
  } = await query.graph({
    entity: "artisan",
    fields: ["*", "products.id", "products.status"],
    filters: { handle: req.params.handle, status: "active" },
  })

  if (!artisan) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy gian hàng")
  }

  res.json({
    artisan: publicArtisan(artisan),
    product_ids: ((artisan.products ?? []) as any[])
      .filter((product) => product?.status === "published")
      .map((product) => product.id),
  })
}
