/**
 * Moves product image links off localhost after deploying. Safe to run again.
 *
 *   pnpm medusa exec ./src/scripts/fix-image-urls.ts
 *
 * Needs STOREFRONT_URL (the deployed storefront) and the S3_* variables in .env.
 * - http://localhost:8000/images/... -> <storefront>/images/... (demo photos
 *   shipped in apps/storefront/public/images)
 * - http://localhost:9000/static/... -> the file in ./static is uploaded to
 *   S3 storage and the link replaced by the new one
 */
import { readFile } from "fs/promises"
import path from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

const OLD_STOREFRONT = "http://localhost:8000"
const OLD_STATIC = "http://localhost:9000/static/"

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

export default async function fixImageUrls({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const fileService = container.resolve(Modules.FILE)

  const storefront = process.env.STOREFRONT_URL
    ? new URL(process.env.STOREFRONT_URL).origin
    : null
  if (!storefront || storefront.includes("localhost")) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Set STOREFRONT_URL to the deployed storefront first"
    )
  }
  if (!process.env.S3_BUCKET) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Set the S3_* variables first, or uploads stay on this computer"
    )
  }

  const uploaded = new Map<string, string>()
  const newUrl = async (url: string): Promise<string> => {
    if (url.startsWith(OLD_STOREFRONT)) {
      return storefront + url.slice(OLD_STOREFRONT.length)
    }
    if (!url.startsWith(OLD_STATIC)) return url
    if (!uploaded.has(url)) {
      const name = decodeURIComponent(url.slice(OLD_STATIC.length))
      const content = await readFile(path.join(process.cwd(), "static", name))
      const [file] = await fileService.createFiles([
        {
          filename: name,
          mimeType: MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream",
          content: content.toString("base64"),
          access: "public",
        },
      ])
      uploaded.set(url, file.url)
    }
    return uploaded.get(url)!
  }

  const like = [`${OLD_STOREFRONT}/%`, `${OLD_STATIC}%`]
  const images: { id: string; url: string }[] = await knex("image")
    .select("id", "url")
    .where((q) => q.whereLike("url", like[0]).orWhereLike("url", like[1]))
  const products: { id: string; thumbnail: string }[] = await knex("product")
    .select("id", "thumbnail")
    .where((q) => q.whereLike("thumbnail", like[0]).orWhereLike("thumbnail", like[1]))

  for (const image of images) {
    await knex("image").where({ id: image.id }).update({ url: await newUrl(image.url) })
  }
  for (const product of products) {
    await knex("product")
      .where({ id: product.id })
      .update({ thumbnail: await newUrl(product.thumbnail) })
  }

  logger.info(
    `Fixed ${images.length} image links and ${products.length} thumbnails ` +
      `(${uploaded.size} files uploaded to storage)`
  )
}
