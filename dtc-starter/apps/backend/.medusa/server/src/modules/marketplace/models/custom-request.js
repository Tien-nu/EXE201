"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_REQUEST_STATUSES = void 0;
const utils_1 = require("@medusajs/framework/utils");
const artisan_1 = __importDefault(require("./artisan"));
/**
 * - pending: waiting for the artisan
 * - quoted: the artisan offered a price and a making time
 * - artisan_declined / customer_declined: one side said no, it ends here
 * - accepted: the customer took the offer, the item is in their cart
 * - ordered: the customer placed an order with it
 */
exports.CUSTOM_REQUEST_STATUSES = [
    "pending",
    "quoted",
    "artisan_declined",
    "accepted",
    "customer_declined",
    "ordered",
];
const CustomRequest = utils_1.model.define("custom_request", {
    id: utils_1.model.id({ prefix: "creq" }).primaryKey(),
    customer_id: utils_1.model.text(),
    customer_email: utils_1.model.text(),
    customer_name: utils_1.model.text().nullable(),
    product_id: utils_1.model.text(),
    variant_id: utils_1.model.text(),
    product_title: utils_1.model.text(),
    thumbnail: utils_1.model.text().nullable(),
    description: utils_1.model.text(),
    color: utils_1.model.text().nullable(),
    size: utils_1.model.text().nullable(),
    quantity: utils_1.model.number().default(1),
    status: utils_1.model.enum([...exports.CUSTOM_REQUEST_STATUSES]).default("pending"),
    quoted_price: utils_1.model.bigNumber().nullable(),
    quoted_lead_days: utils_1.model.number().nullable(),
    artisan_note: utils_1.model.text().nullable(),
    responded_at: utils_1.model.dateTime().nullable(),
    decided_at: utils_1.model.dateTime().nullable(),
    order_id: utils_1.model.text().nullable(),
    artisan: utils_1.model.belongsTo(() => artisan_1.default, { mappedBy: "custom_requests" }),
});
exports.default = CustomRequest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXJlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tYXJrZXRwbGFjZS9tb2RlbHMvY3VzdG9tLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscURBQWlEO0FBQ2pELHdEQUErQjtBQUUvQjs7Ozs7O0dBTUc7QUFDVSxRQUFBLHVCQUF1QixHQUFHO0lBQ3JDLFNBQVM7SUFDVCxRQUFRO0lBQ1Isa0JBQWtCO0lBQ2xCLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsU0FBUztDQUNELENBQUE7QUFFVixNQUFNLGFBQWEsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO0lBQ25ELEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFO0lBQzdDLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3pCLGNBQWMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQzVCLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3RDLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3hCLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3hCLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQzNCLFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3pCLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzlCLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdCLFFBQVEsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNuQyxNQUFNLEVBQUUsYUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsK0JBQXVCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDbkUsWUFBWSxFQUFFLGFBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDMUMsZ0JBQWdCLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUMzQyxZQUFZLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNyQyxZQUFZLEVBQUUsYUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN6QyxVQUFVLEVBQUUsYUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN2QyxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNqQyxPQUFPLEVBQUUsYUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxpQkFBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7Q0FDekUsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsYUFBYSxDQUFBIn0=