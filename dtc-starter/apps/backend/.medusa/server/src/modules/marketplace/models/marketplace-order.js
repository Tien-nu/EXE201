"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_STATUSES = exports.PAYMENT_METHODS = void 0;
const utils_1 = require("@medusajs/framework/utils");
const sub_order_1 = __importDefault(require("./sub-order"));
exports.PAYMENT_METHODS = ["cod", "bank_transfer"];
/**
 * - cod: nothing to collect up front, the carrier collects on delivery
 * - awaiting_transfer: bank transfer, the customer has 10 minutes to pay
 * - transfer_submitted: the customer says they paid, an admin has to check
 * - paid: an admin found the money on the statement
 * - expired: the 10 minutes ran out before the customer confirmed
 * - rejected: an admin could not find the money
 */
exports.PAYMENT_STATUSES = [
    "cod",
    "awaiting_transfer",
    "transfer_submitted",
    "paid",
    "expired",
    "rejected",
];
/** Marketplace data for one Medusa order: how it is paid and its sub-orders. */
const MarketplaceOrder = utils_1.model.define("marketplace_order", {
    id: utils_1.model.id({ prefix: "mpo" }).primaryKey(),
    order_id: utils_1.model.text().unique(),
    display_id: utils_1.model.number(),
    customer_id: utils_1.model.text().nullable(),
    email: utils_1.model.text(),
    currency_code: utils_1.model.text(),
    // Sum of the item totals; shipping is paid to the carrier on delivery.
    items_total: utils_1.model.bigNumber(),
    payment_method: utils_1.model.enum([...exports.PAYMENT_METHODS]),
    payment_status: utils_1.model.enum([...exports.PAYMENT_STATUSES]),
    payment_deadline: utils_1.model.dateTime().nullable(),
    transfer_submitted_at: utils_1.model.dateTime().nullable(),
    paid_at: utils_1.model.dateTime().nullable(),
    sub_orders: utils_1.model.hasMany(() => sub_order_1.default, { mappedBy: "marketplace_order" }),
});
exports.default = MarketplaceOrder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2Utb3JkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tYXJrZXRwbGFjZS9tb2RlbHMvbWFya2V0cGxhY2Utb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscURBQWlEO0FBQ2pELDREQUFrQztBQUVyQixRQUFBLGVBQWUsR0FBRyxDQUFDLEtBQUssRUFBRSxlQUFlLENBQVUsQ0FBQTtBQUVoRTs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxnQkFBZ0IsR0FBRztJQUM5QixLQUFLO0lBQ0wsbUJBQW1CO0lBQ25CLG9CQUFvQjtJQUNwQixNQUFNO0lBQ04sU0FBUztJQUNULFVBQVU7Q0FDRixDQUFBO0FBRVYsZ0ZBQWdGO0FBQ2hGLE1BQU0sZ0JBQWdCLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRTtJQUN6RCxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRTtJQUM1QyxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTtJQUMvQixVQUFVLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRTtJQUMxQixXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxLQUFLLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUNuQixhQUFhLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUMzQix1RUFBdUU7SUFDdkUsV0FBVyxFQUFFLGFBQUssQ0FBQyxTQUFTLEVBQUU7SUFDOUIsY0FBYyxFQUFFLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLHVCQUFlLENBQUMsQ0FBQztJQUNoRCxjQUFjLEVBQUUsYUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsd0JBQWdCLENBQUMsQ0FBQztJQUNqRCxnQkFBZ0IsRUFBRSxhQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdDLHFCQUFxQixFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbEQsT0FBTyxFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDcEMsVUFBVSxFQUFFLGFBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsbUJBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO0NBQzdFLENBQUMsQ0FBQTtBQUVGLGtCQUFlLGdCQUFnQixDQUFBIn0=