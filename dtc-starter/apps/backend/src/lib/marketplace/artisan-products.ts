import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type { FulfillmentType } from "./constants"
import { slugify } from "./format"

export type ArtisanProductInput = {
  title: string
  description?: string | null
  fulfillment_type: FulfillmentType
  lead_days?: number | null
  images?: string[]
  category_ids?: string[]
  status?: "published" | "draft"
}

export type ArtisanVariantInput = {
  id?: string
  price: number
  stock?: number | null
}

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "description",
  "status",
  "thumbnail",
  "metadata",
  "created_at",
  "images.url",
  "categories.id",
  "categories.name",
  "variants.id",
  "variants.title",
  "variants.allow_backorder",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.inventory_items.inventory_item_id",
  "variants.inventory_items.inventory.location_levels.location_id",
  "variants.inventory_items.inventory.location_levels.stocked_quantity",
  "variants.inventory_items.inventory.location_levels.reserved_quantity",
]

/** The shape the artisan portal works with. */
function toArtisanProduct(product: any) {
  const metadata = product.metadata ?? {}

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    status: product.status,
    thumbnail: product.thumbnail,
    images: (product.images ?? []).map((image: any) => image.url),
    categories: (product.categories ?? []).map((category: any) => ({
      id: category.id,
      name: category.name,
    })),
    fulfillment_type:
      metadata.fulfillment_type === "made_to_order" ? "made_to_order" : "ready",
    lead_days: metadata.lead_days ? Number(metadata.lead_days) : null,
    hidden_by_lock: metadata.hidden_by_lock === true,
    created_at: product.created_at,
    variants: (product.variants ?? []).map((variant: any) => {
      const levels = (variant.inventory_items ?? []).flatMap(
        (item: any) => item.inventory?.location_levels ?? []
      )

      return {
        id: variant.id,
        title: variant.title,
        price: Number(
          (variant.prices ?? []).find((price: any) => price.currency_code === "vnd")
            ?.amount ?? 0
        ),
        stock: levels.reduce(
          (sum: number, level: any) => sum + Number(level.stocked_quantity ?? 0),
          0
        ),
        reserved: levels.reduce(
          (sum: number, level: any) => sum + Number(level.reserved_quantity ?? 0),
          0
        ),
      }
    }),
  }
}

export async function listArtisanProducts(
  container: MedusaContainer,
  artisanId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const ids = await artisanProductIds(container, artisanId)

  if (!ids.length) {
    return []
  }

  const { data } = await query.graph({
    entity: "product",
    fields: PRODUCT_FIELDS,
    filters: { id: ids },
  })

  return data
    .map(toArtisanProduct)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
}

async function artisanProductIds(container: MedusaContainer, artisanId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [artisan],
  } = await query.graph({
    entity: "artisan",
    fields: ["products.id"],
    filters: { id: artisanId },
  })

  return ((artisan?.products ?? []) as { id: string }[]).map(
    (product) => product.id
  )
}

export async function getArtisanProduct(
  container: MedusaContainer,
  artisanId: string,
  productId: string
) {
  const ids = await artisanProductIds(container, artisanId)

  if (!ids.includes(productId)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy sản phẩm")
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: PRODUCT_FIELDS,
    filters: { id: productId },
  })

  return toArtisanProduct(product)
}

function assertInput(input: ArtisanProductInput, variants: ArtisanVariantInput[]) {
  if (!input.title?.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vui lòng nhập tên sản phẩm")
  }

  if (input.fulfillment_type === "made_to_order" && !(Number(input.lead_days) > 0)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Hàng làm theo đơn cần số ngày làm lớn hơn 0"
    )
  }

  for (const variant of variants) {
    if (!(Number(variant.price) > 0)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Giá phải lớn hơn 0")
    }
  }
}

const productMetadata = (input: ArtisanProductInput, previous: Record<string, unknown> = {}) => ({
  ...previous,
  fulfillment_type: input.fulfillment_type,
  lead_days:
    input.fulfillment_type === "made_to_order" ? Number(input.lead_days) : null,
})

async function setStock(
  container: MedusaContainer,
  variantId: string,
  stock: number
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [variant],
  } = await query.graph({
    entity: "variant",
    fields: [
      "inventory_items.inventory_item_id",
      "inventory_items.inventory.location_levels.location_id",
    ],
    filters: { id: variantId },
  })
  const inventoryItem = (variant as any)?.inventory_items?.[0]

  if (!inventoryItem) {
    return
  }

  const level = inventoryItem.inventory?.location_levels?.[0]

  if (level) {
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: [
          {
            inventory_item_id: inventoryItem.inventory_item_id,
            location_id: level.location_id,
            stocked_quantity: stock,
          },
        ],
      },
    })
    return
  }

  const {
    data: [location],
  } = await query.graph({ entity: "stock_location", fields: ["id"] })

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: [
        {
          inventory_item_id: inventoryItem.inventory_item_id,
          location_id: location.id,
          stocked_quantity: stock,
        },
      ],
    },
  })
}

/**
 * Every artisan product keeps inventory: ready-made items sell from stock,
 * made-to-order items allow backorders so stock never blocks them.
 */
export async function createArtisanProduct(
  container: MedusaContainer,
  artisanId: string,
  input: ArtisanProductInput & { price: number; stock?: number | null }
) {
  assertInput(input, [{ price: input.price }])

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const [{ data: shippingProfiles }, { data: stores }] = await Promise.all([
    query.graph({ entity: "shipping_profile", fields: ["id"] }),
    query.graph({ entity: "store", fields: ["default_sales_channel_id"] }),
  ])

  const images = (input.images ?? []).filter(Boolean)
  const option = { title: "Phân loại", value: "Tiêu chuẩn" }

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: input.title.trim(),
          description: input.description ?? null,
          handle: `${slugify(input.title)}-${Date.now().toString(36)}`,
          status:
            input.status === "draft" ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
          thumbnail: images[0] ?? null,
          images: images.map((url) => ({ url })),
          shipping_profile_id: shippingProfiles[0]?.id,
          sales_channels: stores[0]?.default_sales_channel_id
            ? [{ id: stores[0].default_sales_channel_id }]
            : [],
          category_ids: input.category_ids ?? [],
          origin_country: "vn",
          metadata: productMetadata(input),
          options: [{ title: option.title, values: [option.value] }],
          variants: [
            {
              title: option.value,
              options: { [option.title]: option.value },
              manage_inventory: true,
              allow_backorder: input.fulfillment_type === "made_to_order",
              prices: [{ currency_code: "vnd", amount: Number(input.price) }],
            },
          ],
        },
      ],
    },
  })

  const product = result[0]

  await link.create({
    [MARKETPLACE_MODULE]: { artisan_id: artisanId },
    [Modules.PRODUCT]: { product_id: product.id },
  })

  await setStock(
    container,
    product.variants[0].id,
    input.fulfillment_type === "ready" ? Math.max(0, Number(input.stock) || 0) : 0
  )

  return getArtisanProduct(container, artisanId, product.id)
}

export async function updateArtisanProduct(
  container: MedusaContainer,
  artisanId: string,
  productId: string,
  input: ArtisanProductInput & { variants: ArtisanVariantInput[] }
) {
  const current = await getArtisanProduct(container, artisanId, productId)
  assertInput(input, input.variants)

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [raw],
  } = await query.graph({ entity: "product", fields: ["metadata"], filters: { id: productId } })

  const images = (input.images ?? current.images).filter(Boolean)

  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: productId },
      update: {
        title: input.title.trim(),
        description: input.description ?? null,
        // A locked shop's products stay hidden until an admin unlocks it.
        status: current.hidden_by_lock
          ? ProductStatus.DRAFT
          : input.status === "draft"
            ? ProductStatus.DRAFT
            : ProductStatus.PUBLISHED,
        thumbnail: images[0] ?? null,
        images: images.map((url) => ({ url })),
        ...(input.category_ids ? { category_ids: input.category_ids } : {}),
        metadata: productMetadata(input, (raw as any)?.metadata ?? {}),
      },
    },
  })

  const ownVariantIds = new Set(current.variants.map((variant) => variant.id))
  const variants = input.variants.filter(
    (variant) => variant.id && ownVariantIds.has(variant.id)
  )

  if (variants.length) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: variants.map((variant) => ({
          id: variant.id!,
          allow_backorder: input.fulfillment_type === "made_to_order",
          prices: [{ currency_code: "vnd", amount: Number(variant.price) }],
        })),
      },
    })
  }

  if (input.fulfillment_type === "ready") {
    for (const variant of variants) {
      if (variant.stock !== undefined && variant.stock !== null) {
        await setStock(container, variant.id!, Math.max(0, Number(variant.stock)))
      }
    }
  }

  return getArtisanProduct(container, artisanId, productId)
}

export async function deleteArtisanProduct(
  container: MedusaContainer,
  artisanId: string,
  productId: string
) {
  await getArtisanProduct(container, artisanId, productId)
  await deleteProductsWorkflow(container).run({ input: { ids: [productId] } })
}
