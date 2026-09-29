"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomRequest = createCustomRequest;
exports.respondToCustomRequest = respondToCustomRequest;
exports.decideCustomRequest = decideCustomRequest;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const marketplace_1 = require("../../modules/marketplace");
const constants_1 = require("./constants");
const format_1 = require("./format");
const notify_1 = require("./notify");
const service = (container) => container.resolve(marketplace_1.MARKETPLACE_MODULE);
const notFound = () => new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy yêu cầu");
async function createCustomRequest(container, customerId, input) {
    if (!input.description?.trim()) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Vui lòng mô tả yêu cầu của bạn");
    }
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const [{ data: products }, { data: customers }] = await Promise.all([
        query.graph({
            entity: "product",
            fields: ["id", "title", "thumbnail", "status", "variants.id", "artisan.*"],
            filters: { id: input.product_id },
        }),
        query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "last_name"],
            filters: { id: customerId },
        }),
    ]);
    const product = products[0];
    const customer = customers[0];
    const artisan = product?.artisan;
    if (!product || product.status !== "published" || !artisan || artisan.status !== "active") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Sản phẩm không nhận yêu cầu làm riêng");
    }
    const request = await service(container).createCustomRequests({
        artisan_id: artisan.id,
        customer_id: customerId,
        customer_email: customer.email ?? "",
        customer_name: [customer.last_name, customer.first_name].filter(Boolean).join(" ") || null,
        product_id: product.id,
        variant_id: product.variants[0].id,
        product_title: product.title,
        thumbnail: product.thumbnail ?? null,
        description: input.description.trim(),
        color: input.color || null,
        size: input.size || null,
        quantity: Math.max(1, Number(input.quantity) || 1),
        status: "pending",
    });
    await (0, notify_1.sendEmail)(container, artisan.email, `Yêu cầu làm riêng mới: ${product.title}`, (0, notify_1.paragraph)(`Khách ${(0, format_1.escapeHtml)(request.customer_name ?? customer.email)} muốn đặt làm riêng <b>${(0, format_1.escapeHtml)(product.title)}</b> (${request.quantity} cái).`) +
        (0, notify_1.paragraph)(`Mô tả: ${(0, format_1.escapeHtml)(request.description)}`) +
        (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/kenh-nghe-nhan/yeu-cau`, "Trả lời yêu cầu"));
    return request;
}
/** The artisan's one answer: a price and a making time, or a refusal. */
async function respondToCustomRequest(container, artisanId, requestId, input) {
    const marketplace = service(container);
    const [request] = await marketplace.listCustomRequests({
        id: requestId,
        artisan_id: artisanId,
    });
    if (!request) {
        throw notFound();
    }
    if (request.status !== "pending") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Yêu cầu này đã được trả lời");
    }
    if (input.accept && (!(Number(input.price) > 0) || !(Number(input.lead_days) > 0))) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Vui lòng nhập giá và số ngày làm lớn hơn 0");
    }
    const updated = await marketplace.updateCustomRequests({
        id: request.id,
        status: input.accept ? "quoted" : "artisan_declined",
        quoted_price: input.accept ? Number(input.price) : null,
        quoted_lead_days: input.accept ? Number(input.lead_days) : null,
        artisan_note: input.note || null,
        responded_at: new Date(),
    });
    await (0, notify_1.sendEmail)(container, request.customer_email, input.accept
        ? `Nghệ nhân đã báo giá yêu cầu làm riêng: ${request.product_title}`
        : `Nghệ nhân từ chối yêu cầu làm riêng: ${request.product_title}`, (input.accept
        ? (0, notify_1.paragraph)(`Giá: <b>${(0, format_1.formatVnd)(Number(input.price) * request.quantity)}</b> cho ${request.quantity} cái (${(0, format_1.formatVnd)(input.price)}/cái), thời gian làm: <b>${input.lead_days} ngày</b>. Bạn có thể đồng ý hoặc từ chối.`)
        : "") +
        (input.note ? (0, notify_1.paragraph)(`Lời nhắn: ${(0, format_1.escapeHtml)(input.note)}`) : "") +
        (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/account/yeu-cau-lam-rieng`, "Xem yêu cầu"));
    return updated;
}
/** Puts the agreed item in the customer's cart at the quoted price. */
async function addAcceptedToCart(container, request, cartId, customerId) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [cart], } = await query.graph({
        entity: "cart",
        fields: ["id", "customer_id", "completed_at", "items.metadata"],
        filters: { id: cartId },
    });
    if (!cart || cart.customer_id !== customerId || cart.completed_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Giỏ hàng không hợp lệ");
    }
    const alreadyInCart = (cart.items ?? []).some((item) => item?.metadata?.custom_request_id === request.id);
    if (alreadyInCart) {
        return;
    }
    await (0, core_flows_1.addToCartWorkflow)(container).run({
        input: {
            cart_id: cartId,
            items: [
                {
                    variant_id: request.variant_id,
                    quantity: request.quantity,
                    unit_price: Number(request.quoted_price),
                    metadata: {
                        custom_request_id: request.id,
                        custom_note: [request.description, request.color, request.size]
                            .filter(Boolean)
                            .join(" · "),
                    },
                },
            ],
        },
    });
}
/** The customer's one answer to the quote. Accepting adds it to the cart. */
async function decideCustomRequest(container, customerId, requestId, input) {
    const marketplace = service(container);
    const [request] = await marketplace.listCustomRequests({ id: requestId, customer_id: customerId }, { relations: ["artisan"] });
    if (!request) {
        throw notFound();
    }
    // An accepted request that is not ordered yet can be put back in the cart.
    if (request.status === "accepted" && input.accept && input.cart_id) {
        await addAcceptedToCart(container, request, input.cart_id, customerId);
        return request;
    }
    if (request.status !== "quoted") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Yêu cầu này không chờ bạn quyết định");
    }
    if (input.accept) {
        if (!input.cart_id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Thiếu giỏ hàng");
        }
        await addAcceptedToCart(container, request, input.cart_id, customerId);
    }
    const updated = await marketplace.updateCustomRequests({
        id: request.id,
        status: input.accept ? "accepted" : "customer_declined",
        decided_at: new Date(),
    });
    await (0, notify_1.sendEmail)(container, request.artisan.email, input.accept
        ? `Khách đồng ý báo giá: ${request.product_title}`
        : `Khách từ chối báo giá: ${request.product_title}`, (0, notify_1.paragraph)(input.accept
        ? "Khách đã đồng ý và đang thanh toán. Bạn sẽ nhận được đơn hàng khi khách đặt xong."
        : "Khách đã từ chối báo giá của bạn."));
    return updated;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXJlcXVlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9jdXN0b20tcmVxdWVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFrQkEsa0RBd0VDO0FBR0Qsd0RBeURDO0FBbURELGtEQXlEQztBQWpRRCxxREFHa0M7QUFDbEMsNERBQStEO0FBQy9ELDJEQUE4RDtBQUU5RCwyQ0FBNEM7QUFDNUMscUNBQWdEO0FBQ2hELHFDQUFxRDtBQUVyRCxNQUFNLE9BQU8sR0FBRyxDQUFDLFNBQTBCLEVBQTRCLEVBQUUsQ0FDdkUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0FBRXZDLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUNwQixJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUE7QUFFakUsS0FBSyxVQUFVLG1CQUFtQixDQUN2QyxTQUEwQixFQUMxQixVQUFrQixFQUNsQixLQU1DO0lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5QixnQ0FBZ0MsQ0FDakMsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNsRSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ1YsTUFBTSxFQUFFLFNBQVM7WUFDakIsTUFBTSxFQUFFLENBQUMsSUFBSSxF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