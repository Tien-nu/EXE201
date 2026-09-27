import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import type { UploadBody } from "../../marketplace-validators"
import { getAuthedArtisan } from "../../../lib/marketplace/artisans"

/** Product photos, sent as base64 JSON by the storefront server. */
export async function POST(
  req: AuthenticatedMedusaRequest<UploadBody>,
  res: MedusaResponse
) {
  await getAuthedArtisan(req)

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: req.validatedBody.files.map((file) => ({
        filename: file.filename,
        mimeType: file.mime_type,
        content: file.content_base64,
        access: "public" as const,
      })),
    },
  })

  res.json({ files: result.map((file) => ({ id: file.id, url: file.url })) })
}
