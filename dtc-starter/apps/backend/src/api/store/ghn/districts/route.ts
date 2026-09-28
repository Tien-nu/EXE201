import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { listDistricts } from "../../../../lib/marketplace/ghn"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const provinceId = Number(req.query.province_id)

  if (!provinceId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Thiếu province_id")
  }

  res.setHeader("Cache-Control", "public, max-age=86400")
  res.json({ data: await listDistricts(provinceId) })
}
