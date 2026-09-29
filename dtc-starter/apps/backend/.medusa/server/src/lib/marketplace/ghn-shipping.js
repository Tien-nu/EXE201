"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHN_CARRIER = void 0;
exports.quoteGhnShipment = quoteGhnShipment;
exports.createGhnShipment = createGhnShipment;
exports.cancelGhnShipment = cancelGhnShipment;
exports.handleGhnStatus = handleGhnStatus;
const utils_1 = require("@medusajs/framework/utils");
const marketplace_1 = require("../../modules/marketplace");
const format_1 = require("./format");
const ghn_1 = require("./ghn");
const notify_1 = require("./notify");
const numbers_1 = require("./numbers");
const transitions_1 = require("./transitions");
exports.GHN_CARRIER = "GHN";
const invalid = (message) => new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, message);
/**
 * Everything GHN needs for one sub-order: pickup at the artisan, delivery to
 * the customer (GHN district/ward saved at checkout) and, for COD, the goods
 * amount the shipper collects for Yarnly. The shipping fee itself is paid by
 * the customer to GHN on delivery.
 */
async function buildGhnInput(container, subOrderId, attempt) {
    const subOrder = await (0, transitions_1.getFullSubOrder)(container, subOrderId);
    const artisan = subOrder.artisan;
    if (subOrder.status !== "ready_to_ship") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Đơn ${subOrder.code}: chỉ tạo vận đơn khi nghệ nhân đã báo làm xong`);
    }
    if (!artisan.pickup_district_name || !artisan.pickup_ward_name || !artisan.pickup_province_name) {
        throw invalid(`Nghệ nhân ${artisan.shop_name} chưa chọn Tỉnh/Quận/Phường lấy hàng trong Hồ sơ gian hàng`);
    }
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const productIds = subOrder.items.map((item) => item.product_id).filter(Boolean);
    const [{ data: orders }, { data: products }] = await Promise.all([
        query.graph({
            entity: "order",
            fields: ["id", "metadata", "shipping_address.*"],
            filters: { id: subOrder.marketplace_order.order_id },
        }),
        productIds.length
            ? query.graph({ entity: "product", fields: ["id", "weight"], filters: { id: productIds } })
            : Promise.resolve({ data: [] }),
    ]);
    const order = orders[0];
    const address = order?.shipping_address;
    const districtId = Number(order?.metadata?.district_id);
    const wardCode = order?.metadata?.ward_code ? String(order.metadata.ward_code) : "";
    if (!address?.phone || !districtId || !wardCode) {
        throw invalid(`Đơn ${subOrder.code} thiếu số điện thoại hoặc Quận/Phường GHN của khách (đơn cũ đặt trước khi có GHN). Hãy dùng "Nhập tay".`);
    }
    const weightOf = (productId) => Number(products.find((product) => product.id === productId)?.weight) || 200;
    return {
        // GHN refuses a client code it has seen before, so retries get a suffix.
        client_order_code: attempt ? `YARNLY${subOrder.code}-${attempt}` : `YARNLY${subOrder.code}`,
        from: {
            name: artisan.shop_name,
            phone: artisan.phone,
            address: artisan.pickup_address,
            ward_name: artisan.pickup_ward_name,
            district_name: artisan.pickup_district_name,
            province_name: artisan.pickup_province_name,
        },
        to: {
            name: [address.last_name, address.first_name].filter(Boolean).join(" ") || "Khách hàng",
            phone: address.phone,
            address: [address.address_1, address.city, address.province].filter(Boolean).join(", "),
            ward_code: wardCode,
            district_id: districtId,
        },
        items: subOrder.items.map((item) => ({
            name: item.variant_title ? `${item.title} (${item.variant_title})` : item.title,
            quantity: item.quantity,
            price: (0, numbers_1.toNumber)(item.unit_price),
            weight: weightOf(item.product_id),
        })),
        cod_amount: subOrder.marketplace_order.payment_method === "cod" ? (0, numbers_1.toNumber)(subOrder.subtotal) : 0,
        insurance_value: (0, numbers_1.toNumber)(subOrder.subtotal),
        content: `Yarnly đơn ${subOrder.code} – đồ len handmade`,
    };
}
const attemptsSoFar = async (container, subOrderId) => {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const subOrder = await marketplace.retrieveSubOrder(subOrderId);
    // carrier_status "cancel" means an earlier GHN order for it was canceled.
    return subOrder.carrier_status === "cancel" ? Date.now() % 100000 : 0;
};
/** Fee and delivery date quoted by GHN; creates nothing. */
async function quoteGhnShipment(container, subOrderId) {
    if (!(0, ghn_1.isGhnConfigured)()) {
        throw invalid("Chưa cấu hình GHN_API_TOKEN / GHN_SHOP_ID");
    }
    const input = await buildGhnInput(container, subOrderId, await attemptsSoFar(container, subOrderId));
    const quote = await (0, ghn_1.previewGhnOrder)(input);
    return {
        total_fee: quote.total_fee,
        expected_delivery_time: quote.expected_delivery_time ?? null,
        cod_amount: input.cod_amount,
        from: input.from,
        to: { ...input.to, phone: input.to.phone },
    };
}
/** Books the GHN pickup and moves the sub-order to "shipping". */
async function createGhnShipment(container, subOrderId) {
    if (!(0, ghn_1.isGhnConfigured)()) {
        throw invalid("Chưa cấu hình GHN_API_TOKEN / GHN_SHOP_ID");
    }
    const input = await buildGhnInput(container, subOrderId, await attemptsSoFar(container, subOrderId));
    const created = await (0, ghn_1.createGhnOrder)(input);
    await (0, transitions_1.shipSubOrder)(container, subOrderId, {
        carrier: exports.GHN_CARRIER,
        tracking_number: created.order_code,
        shipping_fee: created.total_fee ?? null,
        expected_delivery_at: created.expected_delivery_time
            ? new Date(created.expected_delivery_time)
            : null,
        carrier_status: "ready_to_pick",
    });
    return created;
}
/**
 * Cancels the GHN order of a sub-order that was not picked up yet and puts
 * the sub-order back to "ready to ship", so a new shipment can be booked.
 */
async function cancelGhnShipment(container, subOrderId) {
    const subOrder = await (0, transitions_1.getFullSubOrder)(container, subOrderId);
    if (subOrder.carrier !== exports.GHN_CARRIER || !subOrder.tracking_number || subOrder.status !== "shipping") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Đơn ${subOrder.code} không có vận đơn GHN đang giao`);
    }
    await (0, ghn_1.cancelGhnOrder)(subOrder.tracking_number);
    await backToReadyToShip(container, subOrder.id);
}
async function backToReadyToShip(container, subOrderId) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    await marketplace.updateSubOrders({
        id: subOrderId,
        status: "ready_to_ship",
        carrier: null,
        tracking_number: null,
        shipped_at: null,
        shipping_fee: null,
        expected_delivery_at: null,
        carrier_status: "cancel",
    });
}
/**
 * GHN webhook: only moves a sub-order forward along the agreed flow. A status
 * that does not fit the sub-order's current state is recorded and ignored.
 */
async function handleGhnStatus(container, payload) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const orderCode = payload.OrderCode;
    const status = String(payload.Status ?? "").toLowerCase();
    if (!orderCode || !status) {
        return { handled: false, reason: "missing OrderCode/Status" };
    }
    const [subOrder] = await marketplace.listSubOrders({
        carrier: exports.GHN_CARRIER,
        tracking_number: orderCode,
    });
    if (!subOrder) {
        logger.info(`[ghn] webhook for unknown order ${orderCode} (${status})`);
        return { handled: false, reason: "unknown order" };
    }
    await marketplace.updateSubOrders({
        id: subOrder.id,
        carrier_status: status,
        ...(payload.TotalFee ? { shipping_fee: Number(payload.TotalFee) } : {}),
    });
    const label = ghn_1.GHN_STATUS_LABELS[status] ?? status;
    if (status === "delivered" && subOrder.status === "shipping") {
        await (0, transitions_1.markDelivered)(container, subOrder.id);
    }
    else if (status === "returned" && ["shipping", "delivered"].includes(subOrder.status)) {
        await (0, transitions_1.cancelSubOrder)(container, subOrder.id, "system", "Giao hàng không thành công, GHN đã trả hàng về nghệ nhân");
    }
    else if (status === "cancel" && subOrder.status === "shipping") {
        await backToReadyToShip(container, subOrder.id);
        await (0, notify_1.notifyAdmin)(container, `Vận đơn GHN ${orderCode} (đơn ${subOrder.code}) đã bị huỷ`, (0, notify_1.paragraph)("Đơn con đã quay về trạng thái Chờ giao hàng. Vào Admin → Đơn sàn để tạo vận đơn mới."));
    }
    else if (["delivery_fail", "exception", "damage", "lost", "return_fail"].includes(status)) {
        await (0, notify_1.notifyAdmin)(container, `GHN báo "${label}" cho đơn ${subOrder.code}`, (0, notify_1.paragraph)(`Vận đơn <a href="${(0, ghn_1.ghnTrackingUrl)(orderCode)}">${(0, format_1.escapeHtml)(orderCode)}</a>: ${(0, format_1.escapeHtml)(label)}. Vui lòng kiểm tra với GHN.`));
    }
    return { handled: true, sub_order: subOrder.code, status: label };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2huLXNoaXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9naG4tc2hpcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNEhBLDRDQWVDO0FBR0QsOENBbUJDO0FBTUQsOENBU0M7QUFxQkQsMENBMERDO0FBOVBELHFEQUdrQztBQUNsQywyREFBOEQ7QUFFOUQscUNBQXFDO0FBQ3JDLCtCQVFjO0FBQ2QscUNBQWlEO0FBQ2pELHVDQUFvQztBQUNwQywrQ0FLc0I7QUFFVCxRQUFBLFdBQVcsR0FBRyxLQUFLLENBQUE7QUFFaEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUNsQyxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBRTFEOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLGFBQWEsQ0FDMUIsU0FBMEIsRUFDMUIsVUFBa0IsRUFDbEIsT0FBZTtJQUVmLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSw2QkFBZSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUM3RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBYyxDQUFBO0lBRXZDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxlQUFlLEVBQUUsQ0FBQztRQUN4QyxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUM3QixPQUFPLFFBQVEsQ0FBQyxJQUFJLGlEQUFpRCxDQUN0RSxDQUFBO0lBQ0gsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoRyxNQUFNLE9BQU8sQ0FDWCxhQUFhLE9BQU8sQ0FBQyxTQUFTLDREQUE0RCxDQUMz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