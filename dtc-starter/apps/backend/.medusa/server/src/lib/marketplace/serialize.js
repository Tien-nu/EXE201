"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRequestForArtisan = exports.customRequestForCustomer = exports.marketplaceOrderForCustomer = exports.subOrderForCustomer = exports.subOrderForArtisan = exports.publicArtisan = void 0;
const constants_1 = require("./constants");
const ghn_1 = require("./ghn");
const numbers_1 = require("./numbers");
const itemFields = (item) => ({
    id: item.id,
    line_item_id: item.line_item_id,
    product_id: item.product_id,
    title: item.title,
    variant_title: item.variant_title,
    thumbnail: item.thumbnail,
    made_to_order: item.made_to_order,
    quantity: item.quantity,
    unit_price: (0, numbers_1.toNumber)(item.unit_price),
    total: (0, numbers_1.toNumber)(item.total),
});
const timeline = (sub) => ({
    created_at: sub.created_at,
    accept_deadline: sub.accept_deadline,
    accepted_at: sub.accepted_at,
    due_date: sub.due_date,
    ready_at: sub.ready_at,
    shipped_at: sub.shipped_at,
    delivered_at: sub.delivered_at,
    complete_at: sub.complete_at,
    completed_at: sub.completed_at,
    canceled_at: sub.canceled_at,
});
const common = (sub) => ({
    id: sub.id,
    code: sub.code,
    status: sub.status,
    status_label: constants_1.SUB_ORDER_STATUS_LABELS[sub.status] ?? sub.status,
    is_custom: sub.is_custom,
    made_to_order: sub.made_to_order,
    lead_days: sub.lead_days,
    subtotal: (0, numbers_1.toNumber)(sub.subtotal),
    carrier: sub.carrier,
    tracking_number: sub.tracking_number,
    tracking_url: sub.carrier === "GHN" && sub.tracking_number ? (0, ghn_1.ghnTrackingUrl)(sub.tracking_number) : null,
    carrier_status: sub.carrier_status ?? null,
    carrier_status_label: sub.carrier_status
        ? ghn_1.GHN_STATUS_LABELS[sub.carrier_status] ?? sub.carrier_status
        : null,
    shipping_fee: sub.shipping_fee === null || sub.shipping_fee === undefined ? null : (0, numbers_1.toNumber)(sub.shipping_fee),
    expected_delivery_at: sub.expected_delivery_at ?? null,
    canceled_by: sub.canceled_by,
    cancel_reason: sub.cancel_reason,
    items: (sub.items ?? []).map(itemFields),
    ...timeline(sub),
});
const publicArtisan = (artisan) => artisan && {
    id: artisan.id,
    handle: artisan.handle,
    shop_name: artisan.shop_name,
    description: artisan.description,
    avatar_url: artisan.avatar_url,
};
exports.publicArtisan = publicArtisan;
/** What the artisan sees: no customer contact details, like on Shopee. */
const subOrderForArtisan = (sub, customRequest) => ({
    ...common(sub),
    payment_method: sub.marketplace_order?.payment_method,
    payout_id: sub.payout_id,
    custom_request: customRequest
        ? {
            description: customRequest.description,
            color: customRequest.color,
            size: customRequest.size,
            quantity: customRequest.quantity,
            quoted_price: (0, numbers_1.toNumber)(customRequest.quoted_price),
            quoted_lead_days: customRequest.quoted_lead_days,
            artisan_note: customRequest.artisan_note,
        }
        : null,
});
exports.subOrderForArtisan = subOrderForArtisan;
const subOrderForCustomer = (sub) => ({
    ...common(sub),
    refund_status: sub.refund_status,
    artisan: (0, exports.publicArtisan)(sub.artisan),
});
exports.subOrderForCustomer = subOrderForCustomer;
const marketplaceOrderForCustomer = (order, settings) => ({
    id: order.id,
    order_id: order.order_id,
    display_id: order.display_id,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    payment_deadline: order.payment_deadline,
    transfer_submitted_at: order.transfer_submitted_at,
    paid_at: order.paid_at,
    items_total: (0, numbers_1.toNumber)(order.items_total),
    // What is still owed by transfer: canceled sub-orders drop out.
    amount_to_transfer: (order.sub_orders ?? [])
        .filter((sub) => sub.status !== "canceled")
        .reduce((sum, sub) => sum + (0, numbers_1.toNumber)(sub.subtotal), 0),
    transfer_content: `YARNLY ${order.display_id}`,
    bank: settings
        ? {
            name: settings.bank_name,
            code: settings.bank_code,
            account_number: settings.bank_account_number,
            account_name: settings.bank_account_name,
        }
        : null,
    created_at: order.created_at,
    sub_orders: (order.sub_orders ?? [])
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(exports.subOrderForCustomer),
});
exports.marketplaceOrderForCustomer = marketplaceOrderForCustomer;
const customRequestForCustomer = (request) => ({
    id: request.id,
    status: request.status,
    product_id: request.product_id,
    product_title: request.product_title,
    thumbnail: request.thumbnail,
    description: request.description,
    color: request.color,
    size: request.size,
    quantity: request.quantity,
    quoted_price: request.quoted_price === null ? null : (0, numbers_1.toNumber)(request.quoted_price),
    quoted_lead_days: request.quoted_lead_days,
    artisan_note: request.artisan_note,
    responded_at: request.responded_at,
    decided_at: request.decided_at,
    order_id: request.order_id,
    created_at: request.created_at,
    artisan: (0, exports.publicArtisan)(request.artisan),
});
exports.customRequestForCustomer = customRequestForCustomer;
const customRequestForArtisan = (request) => {
    const { artisan: _artisan, ...rest } = (0, exports.customRequestForCustomer)(request);
    return {
        ...rest,
        customer_name: request.customer_name,
    };
};
exports.customRequestForArtisan = customRequestForArtisan;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9zZXJpYWxpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXFEO0FBQ3JELCtCQUF5RDtBQUN6RCx1Q0FBb0M7QUFFcEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO0lBQ1gsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO0lBQy9CLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtJQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7SUFDakIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO0lBQ2pDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztJQUN6QixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7SUFDakMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0lBQ3ZCLFVBQVUsRUFBRSxJQUFBLGtCQUFRLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUNyQyxLQUFLLEVBQUUsSUFBQSxrQkFBUSxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDNUIsQ0FBQyxDQUFBO0FBRUYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQzFCLGVBQWUsRUFBRSxHQUFHLENBQUMsZUFBZTtJQUNwQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7SUFDNUIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO0lBQ3RCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtJQUN0QixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVU7SUFDMUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO0lBQzlCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztJQUM1QixZ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