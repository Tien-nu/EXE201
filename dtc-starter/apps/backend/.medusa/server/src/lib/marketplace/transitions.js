"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullSubOrder = getFullSubOrder;
exports.submitTransfer = submitTransfer;
exports.confirmPayment = confirmPayment;
exports.rejectPayment = rejectPayment;
exports.expireUnpaidOrders = expireUnpaidOrders;
exports.cancelSubOrder = cancelSubOrder;
exports.customerCancelSubOrder = customerCancelSubOrder;
exports.cancelOverdueAcceptances = cancelOverdueAcceptances;
exports.acceptSubOrder = acceptSubOrder;
exports.declineSubOrder = declineSubOrder;
exports.markReadyToShip = markReadyToShip;
exports.shipSubOrder = shipSubOrder;
exports.markDelivered = markDelivered;
exports.completeDeliveredSubOrders = completeDeliveredSubOrders;
exports.markRefunded = markRefunded;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const marketplace_1 = require("../../modules/marketplace");
const constants_1 = require("./constants");
const emails_1 = require("./emails");
const format_1 = require("./format");
const inventory_1 = require("./inventory");
const orders_1 = require("./orders");
const SUB_ORDER_RELATIONS = ["items", "artisan", "marketplace_order"];
const service = (container) => container.resolve(marketplace_1.MARKETPLACE_MODULE);
async function getFullSubOrder(container, id) {
    return (await service(container).retrieveSubOrder(id, {
        relations: SUB_ORDER_RELATIONS,
    }));
}
const notAllowed = (message) => new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, message);
function assertStatus(subOrder, allowed, message) {
    if (!allowed.includes(subOrder.status)) {
        throw notAllowed(`Đơn ${subOrder.code}: ${message}`);
    }
}
function assertOwner(subOrder, artisanId) {
    if (subOrder.artisan.id !== artisanId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
    }
}
// ---- Payment -------------------------------------------------------------
/** Moves every sub-order still waiting on payment to its next state. */
async function startPaidSubOrders(container, marketplaceOrderId) {
    const marketplace = service(container);
    const now = new Date();
    const waiting = await marketplace.listSubOrders({
        marketplace_order_id: marketplaceOrderId,
        status: "pending_payment",
    });
    for (const subOrder of waiting) {
        await marketplace.updateSubOrders({ id: subOrder.id, ...(0, orders_1.startState)(subOrder, now) });
        await (0, emails_1.emailArtisanNewSubOrder)(container, await getFullSubOrder(container, subOrder.id));
    }
}
/** The customer says they made the transfer; an admin still has to check. */
async function submitTransfer(container, marketplaceOrderId) {
    const marketplace = service(container);
    const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId);
    if (order.payment_status !== "awaiting_transfer") {
        throw notAllowed("Đơn này không còn chờ chuyển khoản");
    }
    if (order.payment_deadline && new Date(order.payment_deadline) < new Date()) {
        throw notAllowed("Đã quá 10 phút, đơn hàng đã bị huỷ");
    }
    const updated = await marketplace.updateMarketplaceOrders({
        id: order.id,
        payment_status: "transfer_submitted",
        transfer_submitted_at: new Date(),
    });
    await (0, emails_1.emailTransferSubmitted)(container, order);
    return updated;
}
async function confirmPayment(container, marketplaceOrderId) {
    const marketplace = service(container);
    const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId);
    if (!["awaiting_transfer", "transfer_submitted"].includes(order.payment_status)) {
        throw notAllowed("Đơn này không chờ xác nhận chuyển khoản");
    }
    await marketplace.updateMarketplaceOrders({
        id: order.id,
        payment_status: "paid",
        paid_at: new Date(),
    });
    await (0, emails_1.emailPaymentConfirmed)(container, order);
    await startPaidSubOrders(container, order.id);
}
/** The money never arrived: cancel what was still waiting on it. */
async function rejectPayment(container, marketplaceOrderId, reason) {
    const marketplace = service(container);
    const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId);
    if (!["awaiting_transfer", "transfer_submitted"].includes(order.payment_status)) {
        throw notAllowed("Đơn này không chờ xác nhận chuyển khoản");
    }
    await marketplace.updateMarketplaceOrders({ id: order.id, payment_status: "rejected" });
    await cancelWaitingOnPayment(container, order.id, "admin", reason || "Yarnly không nhận được tiền chuyển khoản");
}
async function cancelWaitingOnPayment(container, marketplaceOrderId, by, reason) {
    const waiting = await service(container).listSubOrders({
        marketplace_order_id: marketplaceOrderId,
        status: "pending_payment",
    });
    for (const subOrder of waiting) {
        await cancelSubOrder(container, subOrder.id, by, reason);
    }
}
/** Job: bank transfers not confirmed by the customer within 10 minutes. */
async function expireUnpaidOrders(container) {
    const marketplace = service(container);
    const overdue = await marketplace.listMarketplaceOrders({
        payment_status: "awaiting_transfer",
        payment_deadline: { $lt: new Date() },
    });
    for (const order of overdue) {
        await marketplace.updateMarketplaceOrders({ id: order.id, payment_status: "expired" });
        await cancelWaitingOnPayment(container, order.id, "system", "Quá 10 phút chưa thanh toán chuyển khoản");
    }
    return overdue.length;
}
// ---- Cancellation --------------------------------------------------------
/**
 * Cancels one sub-order: gives its stock back, flags a refund when the
 * customer already paid by transfer, and cancels the Medusa order once
 * nothing of it is left.
 */
async function cancelSubOrder(container, subOrderId, by, reason) {
    const marketplace = service(container);
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertStatus(subOrder, [
        "pending_payment",
        "pending_acceptance",
        "processing",
        "ready_to_ship",
        "shipping",
        "delivered",
    ], "không thể huỷ ở trạng thái hiện tại");
    const order = subOrder.marketplace_order;
    const paid = order.payment_method === "bank_transfer" &&
        ["paid", "transfer_submitted"].includes(order.payment_status);
    const artisanSawIt = subOrder.status !== "pending_payment";
    await marketplace.updateSubOrders({
        id: subOrder.id,
        status: "canceled",
        canceled_at: new Date(),
        canceled_by: by,
        cancel_reason: reason,
        refund_status: paid ? "pending" : "not_required",
    });
    await (0, inventory_1.releaseReservations)(container, subOrder.items.map((item) => item.line_item_id));
    const siblings = await marketplace.listSubOrders({ marketplace_order_id: order.id });
    if (siblings.every((sibling) => sibling.status === "canceled")) {
        try {
            await (0, core_flows_1.cancelOrderWorkflow)(container).run({
                input: { order_id: order.order_id },
            });
        }
        catch (error) {
            logger.warn(`Could not cancel Medusa order ${order.order_id}: ${error.message}`);
        }
    }
    await (0, emails_1.emailSubOrderCanceled)(container, await getFullSubOrder(container, subOrder.id), artisanSawIt && by !== "artisan");
}
async function customerCancelSubOrder(container, subOrderId, customerId) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    const order = await service(container).retrieveMarketplaceOrder(subOrder.marketplace_order.id);
    if (order.customer_id !== customerId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
    }
    assertStatus(subOrder, ["pending_payment", "pending_acceptance"], "nghệ nhân đã nhận đơn nên không thể tự huỷ");
    await cancelSubOrder(container, subOrderId, "customer", "Khách hàng huỷ đơn");
}
/** Job: sub-orders the artisan did not accept within 12 hours. */
async function cancelOverdueAcceptances(container) {
    const overdue = await service(container).listSubOrders({
        status: "pending_acceptance",
        accept_deadline: { $lt: new Date() },
    });
    for (const subOrder of overdue) {
        await cancelSubOrder(container, subOrder.id, "system", "Nghệ nhân không xác nhận đơn trong 12 tiếng");
    }
    return overdue.length;
}
// ---- Artisan -------------------------------------------------------------
async function acceptSubOrder(container, subOrderId, artisanId) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertOwner(subOrder, artisanId);
    assertStatus(subOrder, ["pending_acceptance"], "không ở trạng thái chờ xác nhận");
    if (subOrder.accept_deadline && new Date(subOrder.accept_deadline) < new Date()) {
        throw notAllowed(`Đơn ${subOrder.code} đã quá hạn 12 tiếng`);
    }
    const now = new Date();
    await service(container).updateSubOrders({
        id: subOrder.id,
        status: "processing",
        accepted_at: now,
        due_date: subOrder.lead_days ? (0, format_1.addMs)(now, subOrder.lead_days * constants_1.DAY) : null,
    });
    await (0, emails_1.emailSubOrderAccepted)(container, await getFullSubOrder(container, subOrder.id));
}
async function declineSubOrder(container, subOrderId, artisanId, reason) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertOwner(subOrder, artisanId);
    assertStatus(subOrder, ["pending_acceptance"], "không ở trạng thái chờ xác nhận");
    await cancelSubOrder(container, subOrderId, "artisan", `Nghệ nhân từ chối: ${reason}`);
}
async function markReadyToShip(container, subOrderId, artisanId) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertOwner(subOrder, artisanId);
    assertStatus(subOrder, ["processing"], "chưa được nhận hoặc đã làm xong");
    await service(container).updateSubOrders({
        id: subOrder.id,
        status: "ready_to_ship",
        ready_at: new Date(),
    });
    await (0, emails_1.emailReadyToShip)(container, await getFullSubOrder(container, subOrder.id));
}
// ---- Admin: shipping -----------------------------------------------------
async function shipSubOrder(container, subOrderId, shipment) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertStatus(subOrder, ["ready_to_ship"], "nghệ nhân chưa báo làm xong");
    await service(container).updateSubOrders({
        id: subOrder.id,
        status: "shipping",
        carrier: shipment.carrier,
        tracking_number: shipment.tracking_number,
        shipping_fee: shipment.shipping_fee ?? null,
        expected_delivery_at: shipment.expected_delivery_at ?? null,
        carrier_status: shipment.carrier_status ?? null,
        shipped_at: new Date(),
    });
    // Ready-made stock leaves the shelf; made-to-order items were never stocked.
    const [madeToOrder, ready] = [true, false].map((flag) => subOrder.items
        .filter((item) => !!item.made_to_order === flag)
        .map((item) => item.line_item_id));
    await (0, inventory_1.consumeReservations)(container, ready);
    await (0, inventory_1.releaseReservations)(container, madeToOrder);
    await (0, emails_1.emailShipping)(container, await getFullSubOrder(container, subOrder.id));
}
async function markDelivered(container, subOrderId) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    assertStatus(subOrder, ["shipping"], "chưa được giao cho đơn vị vận chuyển");
    const now = new Date();
    await service(container).updateSubOrders({
        id: subOrder.id,
        status: "delivered",
        delivered_at: now,
        complete_at: (0, format_1.addMs)(now, constants_1.AUTO_COMPLETE_DAYS * constants_1.DAY),
    });
    await (0, emails_1.emailDelivered)(container, await getFullSubOrder(container, subOrder.id));
}
/** Job: delivered sub-orders whose 2 days have passed. */
async function completeDeliveredSubOrders(container) {
    const marketplace = service(container);
    const due = await marketplace.listSubOrders({
        status: "delivered",
        complete_at: { $lt: new Date() },
    });
    for (const subOrder of due) {
        await marketplace.updateSubOrders({
            id: subOrder.id,
            status: "completed",
            completed_at: new Date(),
        });
        await (0, emails_1.emailCompleted)(container, await getFullSubOrder(container, subOrder.id));
    }
    return due.length;
}
async function markRefunded(container, subOrderId) {
    const subOrder = await getFullSubOrder(container, subOrderId);
    if (subOrder.refund_status !== "pending") {
        throw notAllowed(`Đơn ${subOrder.code} không có khoản cần hoàn`);
    }
    await service(container).updateSubOrders({
        id: subOrder.id,
        refund_status: "refunded",
        refunded_at: new Date(),
    });
    await (0, emails_1.emailRefunded)(container, subOrder);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL21hcmtldHBsYWNlL3RyYW5zaXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUNBLDBDQU9DO0FBdUNELHdDQXdCQztBQUVELHdDQW1CQztBQUdELHNDQW1CQztBQW1CRCxnREFrQkM7QUFTRCx3Q0EwREM7QUFFRCx3REFxQkM7QUFHRCw0REFnQkM7QUFJRCx3Q0F1QkM7QUFFRCwwQ0FXQztBQUVELDBDQWdCQztBQUlELG9DQW9DQztBQUVELHNDQWNDO0FBR0QsZ0VBaUJDO0FBRUQsb0NBY0M7QUF6YkQscURBR2tDO0FBQ2xDLDREQUFpRTtBQUNqRSwyREFBOEQ7QUFFOUQsMkNBQXFEO0FBQ3JELHFDQVlpQjtBQUNqQixxQ0FBZ0M7QUFDaEMsMkNBQXNFO0FBQ3RFLHFDQUFxQztBQUlyQyxNQUFNLG1CQUFtQixHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFBO0FBRXJFLE1BQU0sT0FBTyxHQUFHLENBQUMsU0FBMEIsRUFBNEIsRUFBRSxDQUN2RSxTQUFTLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7QUFFaEMsS0FBSyxVQUFVLGVBQWUsQ0FDbkMsU0FBMEIsRUFDMUIsRUFBVTtJQUVWLE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUU7UUFDcEQsU0FBUyxFQUFFLG1CQUFtQjtLQUMvQixDQUFDLENBQTRCLENBQUE7QUFDaEMsQ0FBQztBQUVELE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FDckMsSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUV6RCxTQUFTLFlBQVksQ0FDbkIsUUFBMEMsRUFDMUMsT0FBaUIsRUFDakIsT0FB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