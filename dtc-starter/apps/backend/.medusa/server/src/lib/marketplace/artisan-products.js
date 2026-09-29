"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listArtisanProducts = listArtisanProducts;
exports.getArtisanProduct = getArtisanProduct;
exports.createArtisanProduct = createArtisanProduct;
exports.updateArtisanProduct = updateArtisanProduct;
exports.deleteArtisanProduct = deleteArtisanProduct;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const marketplace_1 = require("../../modules/marketplace");
const format_1 = require("./format");
// Product and variant details are read as two queries in parallel: one
// graph through product -> pricing -> inventory costs a database round trip
// per hop, and the database is far away.
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
];
const VARIANT_FIELDS = [
    "id",
    "product_id",
    "prices.amount",
    "prices.currency_code",
    "inventory_items.inventory.location_levels.stocked_quantity",
    "inventory_items.inventory.location_levels.reserved_quantity",
];
/** The shape the artisan portal works with. */
function toArtisanProduct(product, variantDetails) {
    const metadata = product.metadata ?? {};
    return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: product.status,
        thumbnail: product.thumbnail,
        images: (product.images ?? []).map((image) => image.url),
        categories: (product.categories ?? []).map((category) => ({
            id: category.id,
            name: category.name,
        })),
        fulfillment_type: metadata.fulfillment_type === "made_to_order" ? "made_to_order" : "ready",
        lead_days: metadata.lead_days ? Number(metadata.lead_days) : null,
        hidden_by_lock: metadata.hidden_by_lock === true,
        created_at: product.created_at,
        variants: (product.variants ?? []).map((variant) => {
            const details = variantDetails.get(variant.id) ?? {};
            const levels = (details.inventory_items ?? []).flatMap((item) => item.inventory?.location_levels ?? []);
            return {
                id: variant.id,
                title: variant.title,
                price: Number((details.prices ?? []).find((price) => price.currency_code === "vnd")
                    ?.amount ?? 0),
                stock: levels.reduce((sum, level) => sum + Number(level.stocked_quantity ?? 0), 0),
                reserved: levels.reduce((sum, level) => sum + Number(level.reserved_quantity ?? 0), 0),
            };
        }),
    };
}
async function readArtisanProducts(container, productIds) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const [{ data: products }, { data: variants }] = await Promise.all([
        query.graph({ entity: "product", fields: PRODUCT_FIELDS, filters: { id: productIds } }),
        query.graph({ entity: "variant", fields: VARIANT_FIELDS, filters: { product_id: productIds } }),
    ]);
    const variantDetails = new Map(variants.map((variant) => [variant.id, variant]));
    return products.map((product) => toArtisanProduct(product, variantDetails));
}
async function listArtisanProducts(container, artisanId) {
    const ids = await artisanProductIds(container, artisanId);
    if (!ids.length) {
        return [];
    }
    return (await readArtisanProducts(container, ids)).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}
async function artisanProductIds(container, artisanId) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [artisan], } = await query.graph({
        entity: "artisan",
        fields: ["products.id"],
        filters: { id: artisanId },
    });
    return (artisan?.products ?? []).map((product) => product.id);
}
async function getArtisanProduct(container, artisanId, productId) {
    const ids = await artisanProductIds(container, artisanId);
    if (!ids.includes(productId)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy sản phẩm");
    }
    const [product] = await readArtisanProducts(container, [productId]);
    return product;
}
function assertInput(input, variants) {
    if (!input.title?.trim()) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Vui lòng nhập tên sản phẩm");
    }
    if (input.fulfillment_type === "made_to_order" && !(Number(input.lead_days) > 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Hàng làm theo đơn cần số ngày làm lớn hơn 0");
    }
    for (const variant of variants) {
        if (!(Number(variant.price) > 0)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Giá phải lớn hơn 0");
        }
    }
}
const productMetadata = (input, previous = {}) => ({
    ...previous,
    fulfillment_type: input.fulfillment_type,
    lead_days: input.fulfillment_type === "made_to_order" ? Number(input.lead_days) : null,
});
async function setStock(container, variantId, stock) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [variant], } = await query.graph({
        entity: "variant",
        fields: [
            "inventory_items.inventory_item_id",
            "inventory_items.inventory.location_levels.location_id",
        ],
        filters: { id: variantId },
    });
    const inventoryItem = variant?.inventory_items?.[0];
    if (!inventoryItem) {
        return;
    }
    const level = inventoryItem.inventory?.location_levels?.[0];
    if (level) {
        await (0, core_flows_1.updateInventoryLevelsWorkflow)(container).run({
            input: {
                updates: [
                    {
                        inventory_item_id: inventoryItem.inventory_item_id,
                        location_id: level.location_id,
                        stocked_quantity: stock,
                    },
                ],
            },
        });
        return;
    }
    const { data: [location], } = await query.graph({ entity: "stock_location", fields: ["id"] });
    await (0, core_flows_1.createInventoryLevelsWorkflow)(container).run({
        input: {
            inventory_levels: [
                {
                    inventory_item_id: inventoryItem.inventory_item_id,
                    location_id: location.id,
                    stocked_quantity: stock,
                },
            ],
        },
    });
}
/**
 * Every artisan product keeps inventory: ready-made items sell from stock,
 * made-to-order items allow backorders so stock never blocks them.
 */
async function createArtisanProduct(container, artisanId, input) {
    assertInput(input, [{ price: input.price }]);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const [{ data: shippingProfiles }, { data: stores }] = await Promise.all([
        query.graph({ entity: "shipping_profile", fields: ["id"] }),
        query.graph({ entity: "store", fields: ["default_sales_channel_id"] }),
    ]);
    const images = (input.images ?? []).filter(Boolean);
    const option = { title: "Phân loại", value: "Tiêu chuẩn" };
    const { result } = await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: input.title.trim(),
                    description: input.description ?? null,
                    handle: `${(0, format_1.slugify)(input.title)}-${Date.now().toString(36)}`,
                    status: input.status === "draft" ? utils_1.ProductStatus.DRAFT : utils_1.ProductStatus.PUBLISHED,
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
    });
    const product = result[0];
    await link.create({
        [marketplace_1.MARKETPLACE_MODULE]: { artisan_id: artisanId },
        [utils_1.Modules.PRODUCT]: { product_id: product.id },
    });
    await setStock(container, product.variants[0].id, input.fulfillment_type === "ready" ? Math.max(0, Number(input.stock) || 0) : 0);
    return getArtisanProduct(container, artisanId, product.id);
}
async function updateArtisanProduct(container, artisanId, productId, input) {
    const current = await getArtisanProduct(container, artisanId, productId);
    assertInput(input, input.variants);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [raw], } = await query.graph({ entity: "product", fields: ["metadata"], filters: { id: productId } });
    const images = (input.images ?? current.images).filter(Boolean);
    await (0, core_flows_1.updateProductsWorkflow)(container).run({
        input: {
            selector: { id: productId },
            update: {
                title: input.title.trim(),
                description: input.description ?? null,
                // A locked shop's products stay hidden until an admin unlocks it.
                status: current.hidden_by_lock
                    ? utils_1.ProductStatus.DRAFT
                    : input.status === "draft"
                        ? utils_1.ProductStatus.DRAFT
                        : utils_1.ProductStatus.PUBLISHED,
                thumbnail: images[0] ?? null,
                images: images.map((url) => ({ url })),
                ...(input.category_ids ? { category_ids: input.category_ids } : {}),
                metadata: productMetadata(input, raw?.metadata ?? {}),
            },
        },
    });
    const ownVariantIds = new Set(current.variants.map((variant) => variant.id));
    const variants = input.variants.filter((variant) => variant.id && ownVariantIds.has(variant.id));
    if (variants.length) {
        await (0, core_flows_1.updateProductVariantsWorkflow)(container).run({
            input: {
                product_variants: variants.map((variant) => ({
                    id: variant.id,
                    allow_backorder: input.fulfillment_type === "made_to_order",
                    prices: [{ currency_code: "vnd", amount: Number(variant.price) }],
                })),
            },
        });
    }
    if (input.fulfillment_type === "ready") {
        for (const variant of variants) {
            if (variant.stock !== undefined && variant.stock !== null) {
                await setStock(container, variant.id, Math.max(0, Number(variant.stock)));
            }
        }
    }
    return getArtisanProduct(container, artisanId, productId);
}
async function deleteArtisanProduct(container, artisanId, productId) {
    await getArtisanProduct(container, artisanId, productId);
    await (0, core_flows_1.deleteProductsWorkflow)(container).run({ input: { ids: [productId] } });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aXNhbi1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvbWFya2V0cGxhY2UvYXJ0aXNhbi1wcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXlIQSxrREFhQztBQWlCRCw4Q0FjQztBQXdGRCxvREFpRUM7QUFFRCxvREE4REM7QUFFRCxvREFPQztBQXRZRCxxREFLa0M7QUFDbEMsNERBT29DO0FBQ3BDLDJEQUE4RDtBQUU5RCxxQ0FBa0M7QUFrQmxDLHVFQUF1RTtBQUN2RSw0RUFBNEU7QUFDNUUseUNBQXlDO0FBQ3pDLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLElBQUk7SUFDSixPQUFPO0lBQ1AsUUFBUTtJQUNSLGFBQWE7SUFDYixRQUFRO0lBQ1IsV0FBVztJQUNYLFVBQVU7SUFDVixZQUFZO0lBQ1osWUFBWTtJQUNaLGVBQWU7SUFDZixpQkFBaUI7SUFDakIsYUFBYTtJQUNiLGdCQUFnQjtDQUNqQixDQUFBO0FBRUQsTUFBTSxjQUFjLEdBQUc7SUFDckIsSUFBSTtJQUNKLFlBQVk7SUFDWixlQUFlO0lBQ2Ysc0JBQXNCO0lBQ3RCLDREQUE0RDtJQUM1RCw2REFBNkQ7Q0FDOUQsQ0FBQTtBQUVELCtDQUErQztBQUMvQyxTQUFTLGdCQUFnQixDQUFDLE9BQVksRUFBRSxjQUFnQztJQUN0RSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQTtJQUV2QyxPQUFPO1FBQ0wsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ2QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1FBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7UUFDaEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1FBQ3RCLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztRQUM1QixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMs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