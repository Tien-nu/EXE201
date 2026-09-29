"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailOrderPlaced = emailOrderPlaced;
exports.emailArtisanNewSubOrder = emailArtisanNewSubOrder;
exports.emailPaymentConfirmed = emailPaymentConfirmed;
exports.emailTransferSubmitted = emailTransferSubmitted;
exports.emailSubOrderAccepted = emailSubOrderAccepted;
exports.emailSubOrderCanceled = emailSubOrderCanceled;
exports.emailReadyToShip = emailReadyToShip;
exports.emailShipping = emailShipping;
exports.emailDelivered = emailDelivered;
exports.emailCompleted = emailCompleted;
exports.emailRefunded = emailRefunded;
const marketplace_1 = require("../../modules/marketplace");
const constants_1 = require("./constants");
const format_1 = require("./format");
const notify_1 = require("./notify");
const ARTISAN_PORTAL_URL = `${constants_1.STOREFRONT_URL}/kenh-nghe-nhan`;
const itemsTable = (items) => `
<table style="width:100%;border-collapse:collapse;font-size:14px">
  ${items
    .map((item) => `<tr>
    <td style="padding:6px 0;border-bottom:1px solid #eee">${item.quantity} × ${(0, format_1.escapeHtml)(item.title)}${item.variant_title ? ` <span style="color:#6b7280">(${(0, format_1.escapeHtml)(item.variant_title)})</span>` : ""}</td>
    <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${(0, format_1.formatVnd)(item.total)}</td>
  </tr>`)
    .join("")}
</table>`;
const orderLink = (sub) => (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/account/orders/details/${sub.marketplace_order.order_id}`, "Xem đơn hàng");
async function emailOrderPlaced(container, marketplaceOrderId) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId, {
        relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
    });
    const subOrders = order.sub_orders
        .map((sub) => `<h4 style="margin-bottom:4px">Đơn ${(0, format_1.escapeHtml)(sub.code)} – ${(0, format_1.escapeHtml)(sub.artisan.shop_name)}</h4>${itemsTable(sub.items)}`)
        .join("");
    const payment = order.payment_method === "bank_transfer"
        ? (0, notify_1.paragraph)(`Bạn đã chọn <b>chuyển khoản</b>. Vui lòng chuyển <b>${(0, format_1.formatVnd)(order.items_total)}</b> trong vòng <b>10 phút</b> (trước ${(0, format_1.formatDateTime)(order.payment_deadline)}) và bấm "Tôi đã chuyển khoản" trên trang đơn hàng, nếu không đơn sẽ tự huỷ.`)
        : (0, notify_1.paragraph)("Bạn đã chọn <b>thanh toán khi nhận hàng (COD)</b>.");
    await (0, notify_1.sendEmail)(container, order.email, `Đặt hàng thành công – đơn #${order.display_id}`, (0, notify_1.paragraph)(`Cảm ơn bạn đã đặt hàng tại Yarnly. Đơn của bạn được chia cho ${order.sub_orders.length} nghệ nhân, mỗi phần giao riêng.`) +
        payment +
        subOrders +
        (0, notify_1.paragraph)("Phí ship do đơn vị vận chuyển thu khi giao hàng.") +
        (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/account/orders/details/${order.order_id}`, "Xem đơn hàng"));
}
async function emailArtisanNewSubOrder(container, sub) {
    const action = sub.status === "processing"
        ? (0, notify_1.paragraph)(`Đây là đơn <b>làm theo yêu cầu riêng</b> mà bạn đã đồng ý. Hạn hoàn thành: <b>${(0, format_1.formatDate)(sub.due_date)}</b>.`)
        : (0, notify_1.paragraph)(`Vui lòng xác nhận nhận đơn trước <b>${(0, format_1.formatDateTime)(sub.accept_deadline)}</b> (12 tiếng). Quá hạn đơn sẽ tự huỷ.`);
    await (0, notify_1.sendEmail)(container, sub.artisan.email, `Bạn có đơn hàng mới ${sub.code}`, action +
        itemsTable(sub.items) +
        (0, notify_1.paragraph)(`Tổng tiền hàng: <b>${(0, format_1.formatVnd)(sub.subtotal)}</b>`) +
        (0, notify_1.link)(`${ARTISAN_PORTAL_URL}/don-hang/${sub.id}`, "Mở đơn hàng"));
}
async function emailPaymentConfirmed(container, order) {
    await (0, notify_1.sendEmail)(container, order.email, `Đã nhận tiền chuyển khoản – đơn #${order.display_id}`, (0, notify_1.paragraph)("Yarnly đã nhận được tiền chuyển khoản của bạn. Đơn hàng đã được gửi tới các nghệ nhân.") + (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/account/orders/details/${order.order_id}`, "Xem đơn hàng"));
}
async function emailTransferSubmitted(container, order) {
    await (0, notify_1.notifyAdmin)(container, `Khách báo đã chuyển khoản – đơn #${order.display_id}`, (0, notify_1.paragraph)(`Khách ${(0, format_1.escapeHtml)(order.email)} báo đã chuyển <b>${(0, format_1.formatVnd)(order.items_total)}</b> cho đơn #${order.display_id} (nội dung "YARNLY ${order.display_id}"). Vui lòng kiểm tra sao kê và xác nhận trong trang Admin → Đơn sàn.`));
}
async function emailSubOrderAccepted(container, sub) {
    const due = sub.due_date
        ? `Nghệ nhân sẽ làm xong trước <b>${(0, format_1.formatDate)(sub.due_date)}</b>.`
        : "Nghệ nhân đang chuẩn bị hàng để giao.";
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Nghệ nhân đã nhận đơn ${sub.code}`, (0, notify_1.paragraph)(`${(0, format_1.escapeHtml)(sub.artisan.shop_name)} đã nhận đơn ${sub.code}. ${due}`) +
        orderLink(sub));
}
async function emailSubOrderCanceled(container, sub, notifyArtisan) {
    const refund = sub.refund_status === "pending"
        ? (0, notify_1.paragraph)(`Số tiền <b>${(0, format_1.formatVnd)(sub.subtotal)}</b> bạn đã chuyển khoản sẽ được Yarnly hoàn lại vào tài khoản đã chuyển.`)
        : "";
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Đơn ${sub.code} đã bị huỷ`, (0, notify_1.paragraph)(`Lý do: ${(0, format_1.escapeHtml)(sub.cancel_reason)}`) +
        itemsTable(sub.items) +
        refund +
        orderLink(sub));
    if (notifyArtisan) {
        await (0, notify_1.sendEmail)(container, sub.artisan.email, `Đơn ${sub.code} đã bị huỷ`, (0, notify_1.paragraph)(`Lý do: ${(0, format_1.escapeHtml)(sub.cancel_reason)}`) + itemsTable(sub.items));
    }
    if (sub.refund_status === "pending") {
        await (0, notify_1.notifyAdmin)(container, `Cần hoàn tiền đơn ${sub.code}`, (0, notify_1.paragraph)(`Đơn ${sub.code} (khách ${(0, format_1.escapeHtml)(sub.marketplace_order.email)}) đã huỷ sau khi khách chuyển khoản. Cần hoàn <b>${(0, format_1.formatVnd)(sub.subtotal)}</b>, sau đó bấm "Đã hoàn tiền" trong Admin → Đơn sàn.`));
    }
}
async function emailReadyToShip(container, sub) {
    await (0, notify_1.notifyAdmin)(container, `Đơn ${sub.code} đã làm xong – cần tạo đơn vận chuyển`, (0, notify_1.paragraph)(`Nghệ nhân <b>${(0, format_1.escapeHtml)(sub.artisan.shop_name)}</b> đã làm xong đơn ${sub.code}.`) +
        `<h4>Lấy hàng tại</h4>` +
        (0, notify_1.paragraph)(`${(0, format_1.escapeHtml)(sub.artisan.shop_name)} – ${(0, format_1.escapeHtml)(sub.artisan.phone)}<br/>${(0, format_1.escapeHtml)(sub.artisan.pickup_address)}`) +
        `<h4>Giao tới</h4>` +
        (0, notify_1.paragraph)(`${(0, format_1.escapeHtml)(sub.shipping_name)} – ${(0, format_1.escapeHtml)(sub.shipping_phone)}<br/>${(0, format_1.escapeHtml)(sub.shipping_address)}`) +
        `<h4>Hàng</h4>` +
        itemsTable(sub.items) +
        (0, notify_1.paragraph)(sub.marketplace_order.payment_method === "cod"
            ? `Thu hộ COD: <b>${(0, format_1.formatVnd)(sub.subtotal)}</b> + phí ship.`
            : "Khách đã chuyển khoản tiền hàng, chỉ thu phí ship."));
}
async function emailShipping(container, sub) {
    const tracking = sub.carrier === "GHN" && sub.tracking_number
        ? ` – <a href="https://donhang.ghn.vn/?order_code=${encodeURIComponent(sub.tracking_number)}">tra cứu</a>`
        : "";
    const fee = sub.shipping_fee
        ? `Phí ship <b>${(0, format_1.formatVnd)(sub.shipping_fee)}</b> trả cho shipper khi nhận hàng.`
        : "Phí ship sẽ do đơn vị vận chuyển thu khi giao hàng.";
    const cod = sub.marketplace_order.payment_method === "cod"
        ? ` Shipper thu thêm tiền hàng <b>${(0, format_1.formatVnd)(sub.subtotal)}</b> (COD).`
        : "";
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Đơn ${sub.code} đang được giao`, (0, notify_1.paragraph)(`Đơn vị vận chuyển: <b>${(0, format_1.escapeHtml)(sub.carrier)}</b><br/>Mã vận đơn: <b>${(0, format_1.escapeHtml)(sub.tracking_number)}</b>${tracking}`) +
        (0, notify_1.paragraph)(fee + cod) +
        orderLink(sub));
}
async function emailDelivered(container, sub) {
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Đơn ${sub.code} đã giao thành công`, (0, notify_1.paragraph)("Đơn hàng đã được giao. Đơn sẽ tự động hoàn thành sau 2 ngày.") + orderLink(sub));
}
async function emailCompleted(container, sub) {
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Đơn ${sub.code} đã hoàn thành`, (0, notify_1.paragraph)("Cảm ơn bạn đã mua đồ handmade tại Yarnly!") + orderLink(sub));
    await (0, notify_1.sendEmail)(container, sub.artisan.email, `Đơn ${sub.code} đã hoàn thành`, (0, notify_1.paragraph)(`Đơn ${sub.code} đã hoàn thành. <b>${(0, format_1.formatVnd)(sub.subtotal)}</b> sẽ được tính vào kỳ chuyển tiền thứ Hai tới.`));
}
async function emailRefunded(container, sub) {
    await (0, notify_1.sendEmail)(container, sub.marketplace_order.email, `Đã hoàn tiền đơn ${sub.code}`, (0, notify_1.paragraph)(`Yarnly đã hoàn <b>${(0, format_1.formatVnd)(sub.subtotal)}</b> cho đơn ${sub.code} vào tài khoản bạn đã chuyển.`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9lbWFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUEwRUEsNENBb0NDO0FBRUQsMERBc0JDO0FBRUQsc0RBWUM7QUFFRCx3REFXQztBQUVELHNEQWVDO0FBRUQsc0RBd0NDO0FBRUQsNENBd0JDO0FBRUQsc0NBMEJDO0FBRUQsd0NBWUM7QUFFRCx3Q0FrQkM7QUFFRCxzQ0FZQztBQWpVRCwyREFBOEQ7QUFFOUQsMkNBQTRDO0FBQzVDLHFDQUtpQjtBQUNqQixxQ0FBa0U7QUFFbEUsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLDBCQUFjLGlCQUFpQixDQUFBO0FBNkM3RCxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUM7O0lBRWxDLEtBQUs7S0FDSixHQUFHLENBQ0YsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDOzZEQUM2QyxJQUFJLENBQUMsUUFBUSxNQUFNLElBQUEsbUJBQVUsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQzlGLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxJQUFBLG1CQUFVLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQ25HOzhFQUN3RSxJQUFBLGtCQUFTLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMzRixDQUNIO0tBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNKLENBQUE7QUFFVCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWlCLEVBQUUsRUFBRSxDQUN0QyxJQUFBLGFBQUksRUFBQyxHQUFHLDBCQUFjLDJCQUEyQixHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUE7QUFFN0YsS0FBSyxVQUFVLGdCQUFnQixDQUNwQyxTQUEwQixFQUMxQixrQkFBMEI7SUFFMUIs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