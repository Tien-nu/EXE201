import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { listWards } from "../../../../lib/marketplace/ghn"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const districtId = Number(req.query.district_id)

  if (!districtId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Thiếu district_id")
  }

  res.setHeader("Cache-Control", "public, max-age=86400")
  res.json({ data: await listWards(districtId) })
}
