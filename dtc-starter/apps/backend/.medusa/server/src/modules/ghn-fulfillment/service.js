"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/**
 * The "Giao Hàng Nhanh (GHN)" shipping option customers pick at checkout.
 *
 * It is a flat 0₫ option on purpose: the customer pays GHN's fee to the
 * shipper on delivery. The real GHN orders are booked per artisan from
 * Admin → Đơn sàn (see src/lib/marketplace/ghn-shipping.ts), because each
 * artisan's parcel is picked up at a different address. Medusa's own
 * "Create Fulfillment" is blocked for marketplace orders.
 */
class GHNFulfillmentService extends utils_1.AbstractFulfillmentProviderService {
    async getFulfillmentOptions() {
        return [{ id: "ghn-standard", name: "GHN Tiêu chuẩn" }];
    }
    async validateFulfillmentData(optionData, data) {
        return { ...optionData, ...data };
    }
    async validateOption() {
        return true;
    }
    async canCalculate() {
        return false;
    }
    async calculatePrice() {
        return { calculated_amount: 0, is_calculated_price_tax_inclusive: true };
    }
    // Only reached for orders placed before the marketplace existed.
    async createFulfillment() {
        return { data: {}, labels: [] };
    }
    async cancelFulfillment() {
        return {};
    }
    async createReturnFulfillment() {
        return { data: {}, labels: [] };
    }
}
GHNFulfillmentService.identifier = "ghn-fulfillment";
exports.default = GHNFulfillmentService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2dobi1mdWxmaWxsbWVudC9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQThFO0FBTzlFOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxxQkFBc0IsU0FBUSwwQ0FBa0M7SUFHcEUsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUE7SUFDekQsQ0FBQztJQUVELEtBQUssQ0FBQyx1QkFBdUIsQ0FDM0IsVUFBbUMsRUFDbkMsSUFBNkI7UUFFN0IsT0FBTyxFQUFFLEdBQUcsVUFBVSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUE7SUFDbkMsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjO1FBQ2xCLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZO1FBQ2hCLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjO1FBQ2xCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsaUNBQWlDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDMUUsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQTtJQUNqQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGlCQUFpQjtRQUNyQixPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFFRCxLQUFLLENBQUMsdUJBQXVCO1FBQzNCLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQTtJQUNqQyxDQUFDOztBQXBDTSxnQ0FBVSxHQUFHLGlCQUFpQixDQUFBO0FBdUN2QyxrQkFBZSxxQkFBcUIsQ0FBQSJ9