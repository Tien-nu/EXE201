"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFUND_STATUSES = exports.CANCELED_BY = exports.SUB_ORDER_STATUSES = void 0;
const utils_1 = require("@medusajs/framework/utils");
const artisan_1 = __importDefault(require("./artisan"));
const marketplace_order_1 = __importDefault(require("./marketplace-order"));
const sub_order_item_1 = __importDefault(require("./sub-order-item"));
exports.SUB_ORDER_STATUSES = [
    "pending_payment",
    "pending_acceptance",
    "processing",
    "ready_to_ship",
    "shipping",
    "delivered",
    "completed",
    "canceled",
];
exports.CANCELED_BY = ["customer", "artisan", "system", "admin"];
exports.REFUND_STATUSES = ["not_required", "pending", "refunded"];
/** The part of an order one artisan makes and ships. */
const SubOrder = utils_1.model.define("sub_order", {
    id: utils_1.model.id({ prefix: "subo" }).primaryKey(),
    // Human readable, e.g. "#12-2": second sub-order of order #12.
    code: utils_1.model.text(),
    status: utils_1.model.enum([...exports.SUB_ORDER_STATUSES]),
    is_custom: utils_1.model.boolean().default(false),
    custom_request_id: utils_1.model.text().nullable(),
    made_to_order: utils_1.model.boolean().default(false),
    // Longest making time among the items, in days.
    lead_days: utils_1.model.number().nullable(),
    subtotal: utils_1.model.bigNumber(),
    shipping_name: utils_1.model.text().nullable(),
    shipping_phone: utils_1.model.text().nullable(),
    shipping_address: utils_1.model.text().nullable(),
    accept_deadline: utils_1.model.dateTime().nullable(),
    accepted_at: utils_1.model.dateTime().nullable(),
    due_date: utils_1.model.dateTime().nullable(),
    ready_at: utils_1.model.dateTime().nullable(),
    carrier: utils_1.model.text().nullable(),
    tracking_number: utils_1.model.text().nullable(),
    // What the carrier charges the customer on delivery, when known (GHN).
    shipping_fee: utils_1.model.bigNumber().nullable(),
    expected_delivery_at: utils_1.model.dateTime().nullable(),
    // Last status reported by the carrier's webhook, e.g. "delivering".
    carrier_status: utils_1.model.text().nullable(),
    shipped_at: utils_1.model.dateTime().nullable(),
    delivered_at: utils_1.model.dateTime().nullable(),
    // When the order completes by itself, 2 days after delivery.
    complete_at: utils_1.model.dateTime().nullable(),
    completed_at: utils_1.model.dateTime().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    canceled_by: utils_1.model.enum([...exports.CANCELED_BY]).nullable(),
    cancel_reason: utils_1.model.text().nullable(),
    refund_status: utils_1.model.enum([...exports.REFUND_STATUSES]).default("not_required"),
    refunded_at: utils_1.model.dateTime().nullable(),
    payout_id: utils_1.model.text().nullable(),
    artisan: utils_1.model.belongsTo(() => artisan_1.default, { mappedBy: "sub_orders" }),
    marketplace_order: utils_1.model.belongsTo(() => marketplace_order_1.default, {
        mappedBy: "sub_orders",
    }),
    items: utils_1.model.hasMany(() => sub_order_item_1.default, { mappedBy: "sub_order" }),
});
exports.default = SubOrder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViLW9yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvbWFya2V0cGxhY2UvbW9kZWxzL3N1Yi1vcmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxREFBaUQ7QUFDakQsd0RBQStCO0FBQy9CLDRFQUFrRDtBQUNsRCxzRUFBMkM7QUFFOUIsUUFBQSxrQkFBa0IsR0FBRztJQUNoQyxpQkFBaUI7SUFDakIsb0JBQW9CO0lBQ3BCLFlBQVk7SUFDWixlQUFlO0lBQ2YsVUFBVTtJQUNWLFdBQVc7SUFDWCxXQUFXO0lBQ1gsVUFBVTtDQUNGLENBQUE7QUFFRyxRQUFBLFdBQVcsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBVSxDQUFBO0FBRWpFLFFBQUEsZUFBZSxHQUFHLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQVUsQ0FBQTtBQUUvRSx3REFBd0Q7QUFDeEQsTUFBTSxRQUFRLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7SUFDekMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDN0MsK0RBQStEO0lBQy9ELElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ2xCLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRywwQkFBa0IsQ0FBQyxDQUFDO0lBQzNDLFNBQVMsRUFBRSxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUN6QyxpQkFBaUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzFDLGFBQWEsRUFBRSxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUM3QyxnREFB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