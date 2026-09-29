import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { customerCancelSubOrder } from "../../../../../../lib/marketplace/transitions"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await customerCancelSubOrder(req.scope, req.params.id, req.auth_context.actor_id)

  res.json({ success: true })
}
