import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import type { ArtisanProfileBody } from "../../marketplace-validators"
import { registerArtisan } from "../../../lib/marketplace/artisans"

/**
 * Second step of sign-up: the token comes from
 * POST /auth/artisan/emailpass/register and has no artisan yet.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<ArtisanProfileBody>,
  res: MedusaResponse
) {
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Tài khoản này đã có gian hàng"
    )
  }

  const artisan = await registerArtisan(
    req.scope,
    req.auth_context.auth_identity_id,
    req.validatedBody
  )

  res.json({ artisan })
}
