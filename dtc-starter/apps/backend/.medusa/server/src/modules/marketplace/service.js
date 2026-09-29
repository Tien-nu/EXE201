"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const artisan_1 = __importDefault(require("./models/artisan"));
const custom_request_1 = __importDefault(require("./models/custom-request"));
const marketplace_order_1 = __importDefault(require("./models/marketplace-order"));
const marketplace_setting_1 = __importDefault(require("./models/marketplace-setting"));
const payout_1 = __importDefault(require("./models/payout"));
const sub_order_1 = __importDefault(require("./models/sub-order"));
const sub_order_item_1 = __importDefault(require("./models/sub-order-item"));
class MarketplaceModuleService extends (0, utils_1.MedusaService)({
    Artisan: artisan_1.default,
    MarketplaceOrder: marketplace_order_1.default,
    SubOrder: sub_order_1.default,
    SubOrderItem: sub_order_item_1.default,
    CustomRequest: custom_request_1.default,
    Payout: payout_1.default,
    MarketplaceSetting: marketplace_setting_1.default,
}) {
    /** The single settings row, created with defaults on first read. */
    async getSettings() {
        const [settings] = await this.listMarketplaceSettings({}, { take: 1 });
        if (settings) {
            return settings;
        }
        return await this.createMarketplaceSettings({
            platform_fee_percent: 0,
            admin_email: process.env.ADMIN_NOTIFY_EMAIL || null,
            bank_name: "MB Bank",
            bank_code: "mb",
            bank_account_number: "0912037670",
            bank_account_name: "YARNLY STORE",
        });
    }
    /**
     * Creates the marketplace order with its sub-orders and their items in one
     * transaction, so an order never exists with only part of its sub-orders.
     */
    async createOrderWithSubOrders(data, sharedContext = {}) {
        return await this.createOrderWithSubOrders_(data, sharedContext);
    }
    async createOrderWithSubOrders_(data, sharedContext = {}) {
        const order = await this.createMarketplaceOrders(data.order, sharedContext);
        for (const { items, ...subOrder } of data.sub_orders) {
            const created = await this.createSubOrders({ ...subOrder, marketplace_order_id: order.id }, sharedContext);
            await this.createSubOrderItems(items.map((item) => ({ ...item, sub_order_id: created.id })), sharedContext);
        }
        return order;
    }
}
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarketplaceModuleService.prototype, "createOrderWithSubOrders", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarketplaceModuleService.prototype, "createOrderWithSubOrders_", null);
exports.default = MarketplaceModuleService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21hcmtldHBsYWNlL3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxxREFLa0M7QUFDbEMsK0RBQXNDO0FBQ3RDLDZFQUFtRDtBQUNuRCxtRkFBeUQ7QUFDekQsdUZBQTZEO0FBQzdELDZEQUFvQztBQUNwQyxtRUFBeUM7QUFDekMsNkVBQWtEO0FBTWxELE1BQU0sd0JBQXlCLFNBQVEsSUFBQSxxQkFBYSxFQUFDO0lBQ25ELE9BQU8sRUFBUCxpQkFBTztJQUNQLGdCQUFnQixFQUFoQiwyQkFBZ0I7SUFDaEIsUUFBUSxFQUFSLG1CQUFRO0lBQ1IsWUFBWSxFQUFaLHdCQUFZO0lBQ1osYUFBYSxFQUFiLHdCQUFhO0lBQ2IsTUFBTSxFQUFOLGdCQUFNO0lBQ04sa0JBQWtCLEVBQWxCLDZCQUFrQjtDQUNuQixDQUFDO0lBQ0Esb0VBQW9FO0lBQ3BFLEtBQUssQ0FBQyxXQUFXO1FBQ2YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRXRFLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixPQUFPLFFBQVEsQ0FBQTtRQUNqQixDQUFDO1FBRUQsT0FBTyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztZQUMxQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLElBQUk7WUFDbkQsU0FBUyxFQUFFLFNBQVM7WUFDcEIsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxZQUFZO1lBQ2pDLGlCQUFpQixFQUFFLGNBQWM7U0FDbEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUVHLEFBQU4sS0FBSyxDQUFDLHdCQUF3QixDQUM1QixJQUFtRSxFQUNsRCxnQkFBeUIsRUFBRTtRQUU1QyxPQUFPLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUNsRSxDQUFDO0lBR2UsQUFBTixLQUFLLENBQUMseUJBQXlCLENBQ3ZDLElBQW1FLEVBQ2xELGdCQUF5QixFQUFFO1FBRTVDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUM5QyxJQUFJLENBQUMsS0FBWSxFQUNqQixhQUFhLENBQ2QsQ0FBQTtRQUVELEtBQUssTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQ3hDLEVBQUUsR0FBRyxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBUyxFQUN0RCxhQUFhLENBQ2QsQ0FBQTtZQUVELE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUM1QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFRLEVBQ25FLGFBQWEsQ0FDZCxDQUFBO1FBQ0gsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztDQUNGO0FBL0JPO0lBREwsSUFBQSxxQkFBYSxHQUFFO0lBR2IsV0FBQSxJQUFBLHFCQUFhLEdBQUUsQ0FBQTs7Ozt3RUFHakI7QUFHZTtJQURmLElBQUEsZ0NBQXdCLEdBQUU7SUFHeEIsV0FBQSxJQUFBLHFCQUFhLEdBQUUsQ0FBQTs7Ozt5RUFvQmpCO0FBR0gsa0JBQWUsd0JBQXdCLENBQUEifQ==