"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startState = void 0;
exports.ensureMarketplaceOrder = ensureMarketplaceOrder;
const utils_1 = require("@medusajs/framework/utils");
const marketplace_1 = require("../../modules/marketplace");
const constants_1 = require("./constants");
const format_1 = require("./format");
const numbers_1 = require("./numbers");
/**
 * State a sub-order enters once it may start: a custom order was already
 * agreed on, so it goes straight to work; anything else waits 12 hours for
 * the artisan to accept.
 */
const startState = (subOrder, now) => subOrder.is_custom
    ? {
        status: "processing",
        accepted_at: now,
        due_date: (0, format_1.addMs)(now, (subOrder.lead_days ?? 0) * constants_1.DAY),
    }
    : {
        status: "pending_acceptance",
        accept_deadline: (0, format_1.addMs)(now, constants_1.ACCEPT_WINDOW_HOURS * constants_1.HOUR),
    };
exports.startState = startState;
/**
 * Creates the marketplace order and one sub-order per artisan for a placed
 * Medusa order. Custom-request items get a sub-order of their own. Safe to
 * call more than once: an existing marketplace order is returned as is.
 */
async function ensureMarketplaceOrder(container, orderId) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const [existing] = await marketplace.listMarketplaceOrders({
        order_id: orderId,
    });
    if (existing) {
        return { marketplaceOrder: existing, created: false };
    }
    const { data: [order], } = await query.graph({
        entity: "order",
        fields: [
            "id",
            "display_id",
            "email",
            "customer_id",
            "currency_code",
            "metadata",
            "created_at",
            "items.*",
            "items.total",
            "shipping_address.*",
        ],
        filters: { id: orderId },
    });
    if (!order) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
    }
    const items = (order.items ?? []);
    const productIds = [
        ...new Set(items.map((item) => item.product_id).filter(Boolean)),
    ];
    const products = productIds.length
        ? (await query.graph({
            entity: "product",
            fields: ["id", "metadata", "artisan.id"],
            filters: { id: productIds },
            withDeleted: true,
        })).data
        : [];
    const productById = new Map(products.map((product) => [product.id, product]));
    const [houseArtisan] = await marketplace.listArtisans({
        handle: constants_1.HOUSE_ARTISAN_HANDLE,
    });
    const groups = new Map();
    for (const item of items) {
        const product = productById.get(item.product_id ?? "");
        const artisanId = product?.artisan?.id ?? houseArtisan?.id;
        if (!artisanId) {
            logger.error(`Order ${order.id}: item ${item.id} has no artisan and there is no house artisan`);
            continue;
        }
        const customRequestId = item.metadata?.custom_request_id ?? null;
        const key = customRequestId ? `custom:${customRequestId}` : artisanId;
        const group = groups.get(key) ?? {
            artisan_id: artisanId,
            custom_request_id: customRequestId,
            items: [],
        };
        group.items.push(item);
        groups.set(key, group);
    }
    const customRequestIds = [...groups.values()]
        .map((group) => group.custom_request_id)
        .filter(Boolean);
    const customRequests = customRequestIds.length
        ? await marketplace.listCustomRequests({ id: customRequestIds })
        : [];
    const isBankTransfer = order.metadata?.payment_method === "manual_bank";
    const now = new Date();
    const address = order.shipping_address;
    const subOrders = [...groups.values()].map((group, index) => {
        const custom = customRequests.find((request) => request.id === group.custom_request_id);
        const madeToOrderDays = group.items.map((item) => {
            const metadata = productById.get(item.product_id ?? "")?.metadata ?? {};
            return metadata.fulfillment_type === "made_to_order"
                ? Number(metadata.lead_days) || 0
                : null;
        });
        const madeToOrder = !!custom || madeToOrderDays.some((days) => days !== null);
        const leadDays = custom
            ? custom.quoted_lead_days ?? 0
            : madeToOrder
                ? Math.max(...madeToOrderDays.map((days) => days ?? 0))
                : null;
        const subOrder = {
            code: `#${order.display_id}-${index + 1}`,
            artisan_id: group.artisan_id,
            is_custom: !!custom,
            custom_request_id: custom?.id ?? null,
            made_to_order: madeToOrder,
            lead_days: leadDays,
            subtotal: group.items.reduce((sum, item) => sum +
                (item.total !== undefined && item.total !== null
                    ? (0, numbers_1.toNumber)(item.total)
                    : (0, numbers_1.toNumber)(item.unit_price) * item.quantity), 0),
            shipping_name: address
                ? [address.last_name, address.first_name].filter(Boolean).join(" ")
                : null,
            shipping_phone: address?.phone ?? null,
            shipping_address: address
                ? [address.address_1, address.city, address.province]
                    .filter(Boolean)
                    .join(", ")
                : null,
            items: group.items.map((item) => ({
                line_item_id: item.id,
                made_to_order: !!custom ||
                    productById.get(item.product_id ?? "")?.metadata?.fulfillment_type ===
                        "made_to_order",
                product_id: item.product_id ?? null,
                variant_id: item.variant_id ?? null,
                title: item.title,
                variant_title: item.variant_title ?? null,
                thumbnail: item.thumbnail ?? null,
                quantity: item.quantity,
                unit_price: (0, numbers_1.toNumber)(item.unit_price),
                total: item.total !== undefined && item.total !== null
                    ? (0, numbers_1.toNumber)(item.total)
                    : (0, numbers_1.toNumber)(item.unit_price) * item.quantity,
            })),
        };
        return {
            ...subOrder,
            ...(isBankTransfer
                ? { status: "pending_payment" }
                : (0, exports.startState)(subOrder, now)),
        };
    });
    try {
        const marketplaceOrder = await marketplace.createOrderWithSubOrders({
            order: {
                order_id: order.id,
                display_id: order.display_id,
                customer_id: order.customer_id ?? null,
                email: order.email,
                currency_code: order.currency_code,
                items_total: subOrders.reduce((sum, sub) => sum + sub.subtotal, 0),
                payment_method: isBankTransfer ? "bank_transfer" : "cod",
                payment_status: isBankTransfer ? "awaiting_transfer" : "cod",
                payment_deadline: isBankTransfer
                    ? (0, format_1.addMs)(new Date(order.created_at), constants_1.PAYMENT_WINDOW_MINUTES * constants_1.MINUTE)
                    : null,
            },
            sub_orders: subOrders,
        });
        if (customRequests.length) {
            await marketplace.updateCustomRequests(customRequests.map((request) => ({
                id: request.id,
                status: "ordered",
                order_id: order.id,
            })));
        }
        return { marketplaceOrder, created: true };
    }
    catch (error) {
        // Another caller created it in the meantime (unique order_id).
        const [raced] = await marketplace.listMarketplaceOrders({ order_id: orderId });
        if (raced) {
            return { marketplaceOrder: raced, created: false };
        }
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9vcmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBd0RBLHdEQXFOQztBQTVRRCxxREFHa0M7QUFDbEMsMkRBQThEO0FBRTlELDJDQU9vQjtBQUNwQixxQ0FBZ0M7QUFDaEMsdUNBQW9DO0FBZXBDOzs7O0dBSUc7QUFDSSxNQUFNLFVBQVUsR0FBRyxDQUN4QixRQUEyRCxFQUMzRCxHQUFTLEVBQ1QsRUFBRSxDQUNGLFFBQVEsQ0FBQyxTQUFTO0lBQ2hCLENBQUMsQ0FBQztRQUNFLE1BQU0sRUFBRSxZQUFxQjtRQUM3QixXQUFXLEVBQUUsR0FBRztRQUNoQixRQUFRLEVBQUUsSUFBQSxjQUFLLEVBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxlQUFHLENBQUM7S0FDdEQ7SUFDSCxDQUFDLENBQUM7UUFDRSxNQUFNLEVBQUUsb0JBQTZCO1FBQ3JDLGVBQWUsRUFBRSxJQUFBLGNBQUssRUFBQyxHQUFHLEVBQUUsK0JBQW1CLEdBQUcsZ0JBQUksQ0FBQztLQUN4RCxDQUFBO0FBYk0sUUFBQSxVQUFVLGNBYWhCO0FBRVA7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxzQkFBc0IsQ0FDMUMsU0FBMEIsRUFDMUIsT0FBZTtJQUVmLE1BQU0sV0FBVyxHQUNmLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUN2QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLHFCQUFxQixDQUFDO1FBQ3pE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