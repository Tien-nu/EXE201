/**
 * Moves product images that still point at localhost into S3 storage
 * (Supabase Storage), so they show on the deployed site. Safe to run again.
 *
 *   pnpm medusa exec ./src/scripts/fix-image-urls.ts
 *
 * Needs the S3_* variables in .env. Reads the files from this computer:
 * - http://localhost:8000/images/... -> apps/storefront/public/images (demo photos)
 * - http://localhost:9000/static/... -> apps/backend/static (earlier uploads)
 * Then rebuilds the search index, which keeps its own copy of each thumbnail
 * (the store listing reads it) and does not see these direct updates.
 */
import { readFile } from "fs/promises"
import path from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

const SOURCES = [
  {
    prefix: "http://localhost:8000/",
    dir: path.join(process.cwd(), "..", "storefront", "public"),
  },
  { prefix: "http://localhost:9000/static/", dir: path.join(process.cwd(), "static") },
]

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

  if (!process.env.S3_BUCKET) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Set the S3_* variables first, or the images would stay on this computer"
    )
  }

  const uploaded = new Map<string, string>()
  const newUrl = async (url: string): Promise<string> => {
    const source = SOURCES.find(({ prefix }) => url.startsWith(prefix))
    if (!source) return url
    if (!uploaded.has(url)) {
      const relative = decodeURIComponent(url.slice(source.prefix.length))
      const file = path.join(source.dir, relative)
      const content = await readFile(file).catch(() => null)
      if (!content) {
        logger.warn(`Missing ${file}, left ${url} unchanged`)
        return url
      }
      const [stored] = await fileService.createFiles([
        {
          filename: path.basename(relative),
          mimeType: MIME[path.extname(relative).toLowerCase()] ?? "application/octet-stream",
          content: content.toString("base64"),
          access: "public",
        },
      ])
      uploaded.set(url, stored.url)
    }
    return uploaded.get(url)!
  }

  const onLocalhost = (column: string) => (q: any) =>
    SOURCES.reduce((where, { prefix }) => where.orWhereLike(column, `${prefix}%`), q)

  const images: { id: string; url: string }[] = await knex("image")
    .select("id", "url")
    .whereNull("deleted_at")
    .where(onLocalhost("url"))
  const products: { id: string; thumbnail: string }[] = await knex("product")
    .select("id", "thumbnail")
    .whereNull("deleted_at")
    .where(onLocalhost("thumbnail"))

  for (const image of images) {
    await knex("image").where({ id: image.id }).update({ url: await newUrl(image.url) })
  }
  for (const product of products) {
    await knex("product")
      .where({ id: product.id })
      .update({ thumbnail: await newUrl(product.thumbnail) })
  }

  await container.resolve(Modules.SEARCH).reindex()

  logger.info(
    `Fixed ${images.length} image links and ${products.length} thumbnails ` +
      `(${uploaded.size} files uploaded to storage)`
  )
}
