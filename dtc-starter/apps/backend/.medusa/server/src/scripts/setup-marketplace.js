"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupMarketplace;
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
const crypto_1 = require("crypto");
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const constants_1 = require("../lib/marketplace/constants");
const marketplace_1 = require("../modules/marketplace");
const HOUSE_EMAIL = process.env.HOUSE_ARTISAN_EMAIL || "nghenhan@yarnly.vn";
// The repository is public, so there is no default password: pass one in
// HOUSE_ARTISAN_PASSWORD or use the random one printed in the log.
const HOUSE_PASSWORD = process.env.HOUSE_ARTISAN_PASSWORD || (0, crypto_1.randomBytes)(9).toString("base64url");
const MADE_TO_ORDER = {
    "ao-cardigan-len": 7,
    "tui-xach-len": 5,
};
async function setupMarketplace({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const auth = container.resolve(utils_1.Modules.AUTH);
    // ---- Settings -----------------------------------------------------------
    const settings = await marketplace.getSettings();
    logger.info(`Settings: fee ${settings.platform_fee_percent}%, bank ${settings.bank_name}`);
    // ---- House artisan ------------------------------------------------------
    let [house] = await marketplace.listArtisans({ handle: constants_1.HOUSE_ARTISAN_HANDLE });
    if (!house) {
        house = await marketplace.createArtisans({
            handle: constants_1.HOUSE_ARTISAN_HANDLE,
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
        });
        logger.info(`Created house artisan ${house.id}`);
    }
    const { success, authIdentity, error } = await auth.register("emailpass", {
        body: { email: HOUSE_EMAIL, password: HOUSE_PASSWORD },
    });
    if (success && authIdentity) {
        await auth.updateAuthIdentities({
            id: authIdentity.id,
            app_metadata: { artisan_id: house.id },
        });
        logger.info(`Artisan login: ${HOUSE_EMAIL} / ${HOUSE_PASSWORD}`);
    }
    else {
        logger.info(`Artisan login for ${HOUSE_EMAIL} already exists (${error})`);
    }
    // ---- Products without an artisan ----------------------------------------
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "metadata", "artisan.id", "variants.id"],
    });
    for (const product of products) {
        if (!product.artisan) {
            await link.create({
                [marketplace_1.MARKETPLACE_MODULE]: { artisan_id: house.id },
                [utils_1.Modules.PRODUCT]: { product_id: product.id },
            });
        }
        if (product.metadata?.fulfillment_type) {
            continue;
        }
        const madeToOrderKey = Object.keys(MADE_TO_ORDER).find((key) => product.handle?.includes(key));
        await (0, core_flows_1.updateProductsWorkflow)(container).run({
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
        });
        if (madeToOrderKey) {
            await (0, core_flows_1.updateProductVariantsWorkflow)(container).run({
                input: {
                    product_variants: product.variants.map((variant) => ({
                        id: variant.id,
                        allow_backorder: true,
                    })),
                },
            });
        }
    }
    logger.info(`Checked ${products.length} products`);
    // ---- Shipping: one free option, the carrier collects on delivery ---------
    const { data: shippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name", "provider_id"],
    });
    // Prefer the GHN option when the team configured one.
    const ordered = [...shippingOptions].sort((a, b) => Number(b.provider_id?.includes("ghn")) - Number(a.provider_id?.includes("ghn")));
    const [keep, ...rest] = ordered;
    if (keep) {
        await (0, core_flows_1.updateShippingOptionsWorkflow)(container).run({
            input: [
                {
                    id: keep.id,
                    name: keep.provider_id?.includes("ghn")
                        ? "Giao Hàng Nhanh (GHN) – phí ship trả khi nhận hàng"
                        : "Giao hàng tiêu chuẩn (phí ship trả khi nhận hàng)",
                    prices: [{ currency_code: "vnd", amount: 0 }],
                },
            ],
        });
        if (rest.length) {
            await (0, core_flows_1.deleteShippingOptionsWorkflow)(container).run({
                input: { ids: rest.map((option) => option.id) },
            });
        }
        logger.info(`Shipping: kept ${keep.id}, removed ${rest.length}`);
    }
    logger.info("Marketplace setup done.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtbWFya2V0cGxhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9zZXR1cC1tYXJrZXRwbGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNDQSxtQ0FpSUM7QUF2S0Q7Ozs7Ozs7Ozs7R0FVRztBQUNILG1DQUFvQztBQUVwQyxxREFHa0M7QUFDbEMsNERBS29DO0FBQ3BDLDREQUFtRTtBQUNuRSx3REFBMkQ7QUFHM0QsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxvQkFBb0IsQ0FBQTtBQUMzRSx5RUFBeUU7QUFDekUsbUVBQW1FO0FBQ25FLE1BQU0sY0FBYyxHQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixJQUFJLElBQUEsb0JBQVcsRUFBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7QUFFNUUsTUFBTSxhQUFhLEdBQTJCO0lBQzVDLGlCQUFpQixFQUFFLENBQUM7SUFDcEIsY0FBYyxFQUFFLENBQUM7Q0FDbEIsQ0FBQTtBQUVjLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNwRSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xFLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RCxNQUFNLFdBQVcsR0FBNkIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRTVDLDRFQUE0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