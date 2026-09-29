import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { CreateCustomRequestBody } from "../../../marketplace-validators"
import { createCustomRequest } from "../../../../lib/marketplace/custom-requests"
import { customRequestForCustomer } from "../../../../lib/marketplace/serialize"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import type MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const requests = await marketplace.listCustomRequests(
    { customer_id: req.auth_context.actor_id },
    { relations: ["artisan"], order: { created_at: "DESC" } }
  )

  res.json({ custom_requests: requests.map(customRequestForCustomer) })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateCustomRequestBody>,
  res: MedusaResponse
) {
  const request = await createCustomRequest(
    req.scope,
    req.auth_context.actor_id,
    req.validatedBody
  )

  res.json({ custom_request: request })
}
