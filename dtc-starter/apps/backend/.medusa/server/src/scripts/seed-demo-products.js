"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedDemoProducts;
/**
 * Demo data only — creates 50 published products so the store page's
 * pagination and option facets have something to work with. Safe to delete
 * along with the products it creates; nothing in the app depends on it.
 *
 *   npx medusa exec ./src/scripts/seed-demo-products.ts
 *
 * Re-running it is a no-op for anything it already created: every product uses
 * a deterministic handle, and existing handles are skipped.
 */
const core_flows_1 = require("@medusajs/medusa/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const PRODUCT_COUNT = 10;
const HANDLE_PREFIX = 'crochet-v3';
/** Products are created in batches so one failure doesn't roll back all 50. */
const BATCH_SIZE = 10;
/** Caps the variant count per product, since options multiply. */
const MAX_VARIANTS = 12;
/** Products per awaited search-ingestion call. */
const INGEST_CHUNK_SIZE = 25;
/**
 * Deterministic PRNG (mulberry32). Keeps re-runs identical, so the same handle
 * always describes the same product.
 */
function makeRandom(seed) {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const ADJECTIVES = [
    'Đáng yêu', 'Thủ công', 'Vintage', 'Xinh xắn', 'Mềm mại',
    'Độc bản', 'Cao cấp', 'Mini', 'Nổi bật', 'Độc đáo'
];
const MATERIALS = ['Len Milk Cotton', 'Len Nhôm', 'Len Cừu', 'Len Sợi To', 'Len Nhung', 'Sợi Cotton Dệt'];
const TYPES = [
    'Gấu Bông Len', 'Hoa Len', 'Móc Khoá Len', 'Áo Cardigan Len', 'Túi Xách Len',
    'Mũ Len Trùm', 'Khăn Choàng Len', 'Thú Bông Amigurumi', 'Lót Ly Len', 'Băng Đô Len'
];
const COLLECTIONS = ['Bộ Sưu Tập Mùa Đông', 'Quà Tặng Ý Nghĩa', 'Phụ Kiện Xinh'];
const TAGS = ['handmade', 'amigurumi', 'quatang', 'len', 'bestseller', 'docban'];
/**
 * Extra shared options, so the store page's option facet shows more than the
 * Size and Color the initial seed creates.
 */
const EXTRA_OPTIONS = [
    { title: 'Chất Liệu', values: ['Len Milk', 'Len Nhung', 'Sợi Cotton', 'Len Baby'] },
    { title: 'Kiểu Dáng', values: ['Tròn', 'Vuông', 'Hoa'] },
    { title: 'Màu Sắc', values: ['Trắng', 'Hồng', 'Xanh Pastel', 'Nâu Vintage'] },
];
const IMAGE_MAP = {
    'Gấu Bông Len': 'http://localhost:8000/images/Gau_bong_len.jpg',
    'Hoa Len': 'http://localhost:8000/images/cuu_hoa_len.jpg',
    'Móc Khoá Len': 'http://localhost:8000/images/moc_khoa.jpg',
    'Áo Cardigan Len': 'http://localhost:8000/images/cardigan.jpg',
    'Túi Xách Len': 'http://localhost:8000/images/tui_xach.jpg',
    'Mũ Len Trùm': 'http://localhost:8000/images/mu_len.jpg',
    'Khăn Choàng Len': 'http://localhost:8000/images/khan_choang.jpg',
    'Thú Bông Amigurumi': 'http://localhost:8000/images/Gau_bong_len.jpg',
    'Lót Ly Len': 'http://localhost:8000/images/lot_ly.jpg',
    'Băng Đô Len': 'http://localhost:8000/images/bang_do.jpg'
};
async function seedDemoProducts({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const random = makeRandom(20260831);
    const pick = (items) => items[Math.floor(random() * items.length)];
    const pickSome = (items, max) => {
        const count = Math.floor(random() * (max + 1));
        return [...items].sort(() => random() - 0.5).slice(0, count);
    };
    // ---- Prerequisites that already exist in the project ----------------------
    const { data: salesChannels } = await query.graph({
        entity: 'sales_channel',
        fields: ['id', 'name'],
    });
    const { data: shippingProfiles } = await query.graph({
        entity: 'shipping_profile',
        fields: ['id'],
    });
    const { data: categories } = await query.graph({
        entity: 'product_category',
        fields: ['id', 'name'],
    });
    const { data: stores } = await query.graph({
        entity: 'store',
        fields: ['id', 'supported_currencies.currency_code'],
    });
    const { data: stockLocations } = await query.graph({
        entity: 'stock_location',
        fields: ['id'],
    });
    const salesChannel = salesChannels[0];
    const shippingProfile = shippingProfiles[0];
    const stockLocation = stockLocations[0];
    if (!salesChannel || !shippingProfile || !stockLocation) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, 'No sales channel, shipping profile, or stock location found. Run the initial data seed first.');
    }
    const currencyCodes = (stores[0]?.supported_currencies ?? [])
        .map((currency) => currency?.currency_code)
        .filter((code) => Boolean(code));
    if (!currencyCodes.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, 'The store has no supported currencies.');
    }
    logger.info(`Seeding into "${salesChannel.name}" with currencies: ${currencyCodes.join(', ')}`);
    // ---- Collections, tags and extra options --------------------------------
    const { data: existingCollections } = await query.graph({
        entity: 'product_collection',
        fields: ['id', 'title'],
    });
    const missingCollections = COLLECTIONS.filter((title) => !existingCollections.some((collection) => collection.title === title));
    if (missingCollections.length) {
        await (0, core_flows_1.createCollectionsWorkflow)(container).run({
            input: { collections: missingCollections.map((title) => ({ title })) },
        });
        logger.info(`Created ${missingCollections.length} collection(s)`);
    }
    const { data: allCollections } = await query.graph({
        entity: 'product_collection',
        fields: ['id', 'title'],
    });
    const { data: existingTags } = await query.graph({
        entity: 'product_tag',
        fields: ['id', 'value'],
    });
    const missingTags = TAGS.filter((value) => !existingTags.some((tag) => tag.value === value));
    if (missingTags.length) {
        await (0, core_flows_1.createProductTagsWorkflow)(container).run({
            input: { product_tags: missingTags.map((value) => ({ value })) },
        });
        logger.info(`Created ${missingTags.length} tag(s)`);
    }
    const { data: allTags } = await query.graph({
        entity: 'product_tag',
        fields: ['id', 'value'],
    });
    // Shared (non-exclusive) options, the way the initial seed defines them.
    const { data: existingOptions } = await query.graph({
        entity: 'product_option',
        fields: ['id', 'title', 'values.value'],
        filters: { is_exclusive: false },
    });
    const missingOptions = EXTRA_OPTIONS.filter((option) => !existingOptions.some((existing) => existing.title === option.title));
    if (missingOptions.length) {
        await (0, core_flows_1.createProductOptionsWorkflow)(container).run({
            input: { product_options: missingOptions },
        });
        logger.info(`Created ${missingOptions.length} shared option(s)`);
    }
    const { data: optionRows } = await query.graph({
        entity: 'product_option',
        fields: ['id', 'title', 'values.value'],
        filters: { is_exclusive: false },
    });
    const sharedOptions = optionRows
        .map((option) => ({
        id: option.id,
        title: option.title,
        values: (option.values ?? [])
            .map((value) => value?.value)
            .filter((value) => Boolean(value)),
    }))
        .filter((option) => option.values.length > 0);
    let baseOption = sharedOptions.find((option) => option.title === 'Size' || option.title === 'Kích Thước' || option.title === 'Chất Liệu');
    if (!baseOption) {
        baseOption = sharedOptions[0];
    }
    // ---- Build the products -------------------------------------------------
    const { data: alreadySeeded } = await query.graph({
        entity: 'product',
        fields: ['handle'],
    });
    const takenHandles = new Set(alreadySeeded.map((product) => product.handle).filter(Boolean));
    const products = [];
    for (let index = 0; index < PRODUCT_COUNT; index++) {
        // Derived from the index, never from the PRNG. Skipping a product consumes
        // fewer random numbers than building one, so a handle that depended on the
        // PRNG would shift after the first skip and the script would create
        // duplicates instead of recognising its own products.
        const type = TYPES[index % TYPES.length];
        // Convert to URL-safe handle (remove accents, replace spaces with hyphens)
        const urlSafeType = type.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        const handle = `${HANDLE_PREFIX}-${index + 1}-${urlSafeType}`;
        if (takenHandles.has(handle)) {
            continue;
        }
        const title = `${pick(ADJECTIVES)} ${pick(MATERIALS)} ${type}`;
        const chosenOptions = [
            baseOption,
            ...pickSome(sharedOptions.filter((option) => option.title !== baseOption.title), 2),
        ];
        // Cartesian product of the chosen options' values, capped.
        let combinations = [{}];
        for (const option of chosenOptions) {
            const next = [];
            for (const combination of combinations) {
                for (const value of option.values) {
                    if (next.length >= MAX_VARIANTS) {
                        break;
                    }
                    next.push({ ...combination, [option.title]: value });
                }
            }
            combinations = next;
        }
        const collection = pick(allCollections);
        const chosenTags = pickSome(allTags, 3);
        const chosenCategories = pickSome(categories, 2);
        const thumbnail = IMAGE_MAP[type] || IMAGE_MAP['Gấu Bông Len'];
        const basePrice = (10 + Math.floor(random() * 90)) * 10000;
        products.push({
            title,
            handle,
            subtitle: `${type} — demo data`,
            description: `A ${title.toLowerCase()} generated to fill out the demo catalogue. Not a real product.`,
            status: utils_1.ProductStatus.PUBLISHED,
            thumbnail,
            images: [{ url: thumbnail }],
            weight: 300 + Math.floor(random() * 500),
            shipping_profile_id: shippingProfile.id,
            collection_id: collection?.id,
            tag_ids: chosenTags.map((tag) => tag.id),
            category_ids: chosenCategories.map((category) => category.id),
            sales_channels: [{ id: salesChannel.id }],
            options: chosenOptions.map((option) => ({ id: option.id })),
            variants: combinations.map((combination) => ({
                title: Object.values(combination).join(' / '),
                sku: `${handle.toUpperCase()}-${Object.values(combination).join('-').toUpperCase()}`,
                manage_inventory: true,
                options: combination,
                prices: currencyCodes.map((currency_code) => ({
                    amount: basePrice,
                    currency_code,
                })),
            })),
        });
    }
    if (!products.length) {
        logger.info('Every demo product already exists. Nothing to do.');
        return;
    }
    // ---- Create them --------------------------------------------------------
    let created = 0;
    for (let start = 0; start < products.length; start += BATCH_SIZE) {
        const batch = products.slice(start, start + BATCH_SIZE);
        await (0, core_flows_1.createProductsWorkflow)(container).run({
            input: { products: batch },
        });
        created += batch.length;
        logger.info(`Created ${created}/${products.length} demo products`);
    }
    // ---- Inventory ----------------------------------------------------------
    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "location_levels.location_id"],
    });
    const missingLevels = inventoryItems.filter((item) => !item.location_levels?.some((lvl) => lvl.location_id === stockLocation.id));
    if (missingLevels.length) {
        // Inventory levels have to be created in smaller batches to avoid passing too large of an array
        let levelsCreated = 0;
        for (let start = 0; start < missingLevels.length; start += 50) {
            const batch = missingLevels.slice(start, start + 50);
            await (0, core_flows_1.createInventoryLevelsWorkflow)(container).run({
                input: {
                    inventory_levels: batch.map((item) => ({
                        location_id: stockLocation.id,
                        stocked_quantity: 20,
                        inventory_item_id: item.id,
                    })),
                },
            });
            levelsCreated += batch.length;
        }
        logger.info(`Created inventory levels for ${levelsCreated} items with 20 quantity each.`);
    }
    // ---- Make sure the search index caught up -------------------------------
    // `product.created` is emitted on the local event bus and handled
    // asynchronously, so a short-lived `medusa exec` process can exit before the
    // last batch is ingested. Replaying the ingestion here is awaited, and
    // `consume` upserts, so it is safe to run over every product.
    const search = container.resolve(utils_1.Modules.SEARCH);
    const { data: allProducts } = await query.graph({
        entity: 'product',
        fields: ['id'],
    });
    for (let start = 0; start < allProducts.length; start += INGEST_CHUNK_SIZE) {
        const chunk = allProducts.slice(start, start + INGEST_CHUNK_SIZE);
        await search.ingest({
            name: 'product.created',
            data: chunk.map((product) => ({ id: product.id })),
        });
    }
    logger.info(`Search index caught up for ${allProducts.length} product(s).`);
    logger.info('Done. Open the store page to see the new products.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1kZW1vLXByb2R1Y3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2VlZC1kZW1vLXByb2R1Y3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBdUZBLG1DQXVUQztBQTlZRDs7Ozs7Ozs7O0dBU0c7QUFDSCw0REFNb0M7QUFDcEMscURBS2tDO0FBR2xDLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQTtBQUN4QixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUE7QUFDbEMsK0VBQStFO0FBQy9FLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNyQixrRUFBa0U7QUFDbEUsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFBO0FBQ3ZCLGtEQUFrRDtBQUNsRCxNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTtBQUU1Qjs7O0dBR0c7QUFDSCxTQUFTLFVBQVUsQ0FBQyxJQUFZO0lBQzlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQTtJQUVoQixPQUFPLEdBQUcsRUFBRTtRQUNWLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFBO1FBQ3BELENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO0lBQzlDLENBQUMsQ0FBQTtBQUNILENBQUM7QUFF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