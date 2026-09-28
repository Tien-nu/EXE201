import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const baseUrl = process.env.GHN_API_URL?.replace("/v2", "") || "https://online-gateway.ghn.vn/shiip/public-api"
    const response = await fetch(`${baseUrl}/master-data/province`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Token": process.env.GHN_API_TOKEN as string,
      },
    })
    
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces from GHN" })
  }
}
