/**
 * One-time setup for the Yarnly marketplace. Safe to run again.
 *
 *   pnpm medusa exec ./src/scripts/setup-marketplace.ts
 *
 * - creates the platform settings row (0% fee, admin Gmail, Yarnly's bank)
 * - creates the house shop "Xưởng len Yarnly" with a login for testing
 * - gives every product without an artisan to that shop and marks it ready-made
 *   (cardigans and bags become made-to-order, to demo both flows)
 * - leaves one free shipping option: shipping is paid to the carrier on delivery
 */
import { randomBytes } from "crypto"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteShippingOptionsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { HOUSE_ARTISAN_HANDLE } from "../lib/marketplace/constants"
import { MARKETPLACE_MODULE } from "../modules/marketplace"
import type MarketplaceModuleService from "../modules/marketplace/service"

const HOUSE_EMAIL = process.env.HOUSE_ARTISAN_EMAIL || "nghenhan@yarnly.vn"
// The repository is public, so there is no default password: pass one in
// HOUSE_ARTISAN_PASSWORD or use the random one printed in the log.
const HOUSE_PASSWORD =
  process.env.HOUSE_ARTISAN_PASSWORD || randomBytes(9).toString("base64url")

const MADE_TO_ORDER: Record<string, number> = {
  "ao-cardigan-len": 7,
  "tui-xach-len": 5,
}

export default async function setupMarketplace({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const marketplace: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
  const auth = container.resolve(Modules.AUTH)

  // ---- Settings -----------------------------------------------------------
  const settings = await marketplace.getSettings()
  logger.info(`Settings: fee ${settings.platform_fee_percent}%, bank ${settings.bank_name}`)

  // ---- House artisan ------------------------------------------------------
  let [house] = await marketplace.listArtisans({ handle: HOUSE_ARTISAN_HANDLE })

  if (!house) {
    house = await marketplace.createArtisans({
      handle: HOUSE_ARTISAN_HANDLE,
      shop_name: "Xưởng len Yarnly",
      full_name: "Yarnly",
      email: HOUSE_EMAIL,
      phone: "0912037670",
      description: "Gian hàng chính thức của Yarnly – đồ len móc thủ công.",
      pickup_address: "Yarnly, Việt Nam",
      bank_name: settings.bank_name ?? "MB Bank",
      bank_account_number: settings.bank_account_number ?? "",
      bank_account_name: settings.bank_account_name ?? "YARNLY STORE",
      status: "active",
    })
    logger.info(`Created house artisan ${house.id}`)
  }

  const { success, authIdentity, error } = await auth.register("emailpass", {
    body: { email: HOUSE_EMAIL, password: HOUSE_PASSWORD },
  } as any)

  if (success && authIdentity) {
    await auth.updateAuthIdentities({
      id: authIdentity.id,
      app_metadata: { artisan_id: house.id },
    })
    logger.info(`Artisan login: ${HOUSE_EMAIL} / ${HOUSE_PASSWORD}`)
  } else {
    logger.info(`Artisan login for ${HOUSE_EMAIL} already exists (${error})`)
  }

  // ---- Products without an artisan ----------------------------------------
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "artisan.id", "variants.id"],
  })

  for (const product of products as any[]) {
    if (!product.artisan) {
      await link.create({
        [MARKETPLACE_MODULE]: { artisan_id: house.id },
        [Modules.PRODUCT]: { product_id: product.id },
      })
    }

    if (product.metadata?.fulfillment_type) {
      continue
    }

    const madeToOrderKey = Object.keys(MADE_TO_ORDER).find((key) =>
      product.handle?.includes(key)
    )

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          metadata: {
            ...(product.metadata ?? {}),
            fulfillment_type: madeToOrderKey ? "made_to_order" : "ready",
            lead_days: madeToOrderKey ? MADE_TO_ORDER[madeToOrderKey] : null,
          },
        },
      },
    })

    if (madeToOrderKey) {
      await updateProductVariantsWorkflow(container).run({
        input: {
          product_variants: product.variants.map((variant: any) => ({
            id: variant.id,
            allow_backorder: true,
          })),
        },
      })
    }
  }

  logger.info(`Checked ${products.length} products`)

  // ---- Shipping: one free option, the carrier collects on delivery ---------
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  })

  const [keep, ...rest] = shippingOptions

  if (keep) {
    await updateShippingOptionsWorkflow(container).run({
      input: [
        {
          id: keep.id,
          name: "Giao hàng tiêu chuẩn (phí ship trả khi nhận hàng)",
          prices: [{ currency_code: "vnd", amount: 0 }],
        },
      ],
    })

    if (rest.length) {
      await deleteShippingOptionsWorkflow(container).run({
        input: { ids: rest.map((option) => option.id) },
      })
    }

    logger.info(`Shipping: kept ${keep.id}, removed ${rest.length}`)
  }

  logger.info("Marketplace setup done.")
}
