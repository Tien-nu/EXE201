"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYOUT_STATUSES = void 0;
const utils_1 = require("@medusajs/framework/utils");
const artisan_1 = __importDefault(require("./artisan"));
exports.PAYOUT_STATUSES = ["pending", "paid"];
/** One Monday transfer from Yarnly to an artisan. */
const Payout = utils_1.model.define("payout", {
    id: utils_1.model.id({ prefix: "pay" }).primaryKey(),
    period_start: utils_1.model.dateTime(),
    period_end: utils_1.model.dateTime(),
    sub_order_count: utils_1.model.number(),
    gross_amount: utils_1.model.bigNumber(),
    fee_percent: utils_1.model.float(),
    fee_amount: utils_1.model.bigNumber(),
    net_amount: utils_1.model.bigNumber(),
    // Bank details at the time the payout was made.
    bank_name: utils_1.model.text(),
    bank_account_number: utils_1.model.text(),
    bank_account_name: utils_1.model.text(),
    status: utils_1.model.enum([...exports.PAYOUT_STATUSES]).default("pending"),
    transaction_ref: utils_1.model.text().nullable(),
    paid_at: utils_1.model.dateTime().nullable(),
    artisan: utils_1.model.belongsTo(() => artisan_1.default, { mappedBy: "payouts" }),
});
exports.default = Payout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvbWFya2V0cGxhY2UvbW9kZWxzL3BheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxREFBaUQ7QUFDakQsd0RBQStCO0FBRWxCLFFBQUEsZUFBZSxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBVSxDQUFBO0FBRTNELHFEQUFxRDtBQUNyRCxNQUFNLE1BQU0sR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRTtJQUM1QyxZQUFZLEVBQUUsYUFBSyxDQUFDLFFBQVEsRUFBRTtJQUM5QixVQUFVLEVBQUUsYUFBSyxDQUFDLFFBQVEsRUFBRTtJQUM1QixlQUFlLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRTtJQUMvQixZQUFZLEVBQUUsYUFBSyxDQUFDLFNBQVMsRUFBRTtJQUMvQixXQUFXLEVBQUUsYUFBSyxDQUFDLEtBQUssRUFBRTtJQUMxQixVQUFVLEVBQUUsYUFBSyxDQUFDLFNBQVMsRUFBRTtJQUM3QixVQUFVLEVBQUUsYUFBSyxDQUFDLFNBQVMsRUFBRTtJQUM3QixnREFBZ0Q7SUFDaEQsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDdkIsbUJBQW1CLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUNqQyxpQkFBaUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQy9CLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyx1QkFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQzNELGVBQWUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3hDLE9BQU8sRUFBRSxhQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3BDLE9BQU8sRUFBRSxhQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUM7Q0FDakUsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsTUFBTSxDQUFBIn0=