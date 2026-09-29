"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARTISAN_STATUSES = void 0;
const utils_1 = require("@medusajs/framework/utils");
const custom_request_1 = __importDefault(require("./custom-request"));
const payout_1 = __importDefault(require("./payout"));
const sub_order_1 = __importDefault(require("./sub-order"));
exports.ARTISAN_STATUSES = ["pending", "active", "rejected", "locked"];
const Artisan = utils_1.model.define("artisan", {
    id: utils_1.model.id({ prefix: "art" }).primaryKey(),
    handle: utils_1.model.text().unique(),
    shop_name: utils_1.model.text().searchable(),
    full_name: utils_1.model.text(),
    email: utils_1.model.text().unique(),
    phone: utils_1.model.text(),
    description: utils_1.model.text().nullable(),
    avatar_url: utils_1.model.text().nullable(),
    // Where the carrier picks the parcels up: street + GHN administrative units.
    pickup_address: utils_1.model.text(),
    pickup_province_name: utils_1.model.text().nullable(),
    pickup_district_id: utils_1.model.number().nullable(),
    pickup_district_name: utils_1.model.text().nullable(),
    pickup_ward_code: utils_1.model.text().nullable(),
    pickup_ward_name: utils_1.model.text().nullable(),
    bank_name: utils_1.model.text(),
    bank_account_number: utils_1.model.text(),
    bank_account_name: utils_1.model.text(),
    status: utils_1.model.enum([...exports.ARTISAN_STATUSES]).default("pending"),
    // Why the account was rejected or locked, shown to the artisan.
    status_reason: utils_1.model.text().nullable(),
    sub_orders: utils_1.model.hasMany(() => sub_order_1.default, { mappedBy: "artisan" }),
    custom_requests: utils_1.model.hasMany(() => custom_request_1.default, { mappedBy: "artisan" }),
    payouts: utils_1.model.hasMany(() => payout_1.default, { mappedBy: "artisan" }),
});
exports.default = Artisan;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aXNhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21hcmtldHBsYWNlL21vZGVscy9hcnRpc2FuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFEQUFpRDtBQUNqRCxzRUFBNEM7QUFDNUMsc0RBQTZCO0FBQzdCLDREQUFrQztBQUVyQixRQUFBLGdCQUFnQixHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFVLENBQUE7QUFFcEYsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7SUFDdEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDNUMsTUFBTSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFDN0IsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDcEMsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDdkIsS0FBSyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFDNUIsS0FBSyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDbkIsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDcEMsVUFBVSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbkMsNkVBQTZFO0lBQzdFLGNBQWMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQzVCLG9CQUFvQixFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDN0Msa0JBQWtCLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QyxvQkFBb0IsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdDLGdCQUFnQixFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDekMsZ0JBQWdCLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN6QyxTQUFTLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUN2QixtQkFBbUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ2pDLGlCQUFpQixFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDL0IsTUFBTSxFQUFFLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLHdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQzVELGdFQUFnRTtJQUNoRSxhQUFhLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN0QyxVQUFVLEVBQUUsYUFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxtQkFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBQ2xFLGVBQWUsRUFBRSxhQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLHdCQUFhLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDNUUsT0FBTyxFQUFFLGFBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsZ0JBQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQztDQUM5RCxDQUFDLENBQUE7QUFFRixrQkFBZSxPQUFPLENBQUEifQ==