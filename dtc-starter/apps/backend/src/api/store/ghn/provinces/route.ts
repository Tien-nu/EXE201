import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listProvinces } from "../../../../lib/marketplace/ghn"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "public, max-age=86400")
  res.json({ data: await listProvinces() })
}
