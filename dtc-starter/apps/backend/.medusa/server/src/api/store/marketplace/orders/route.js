"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const serialize_1 = require("../../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../../modules/marketplace");
/** The customer's orders with their sub-orders. */
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const orders = await marketplace.listMarketplaceOrders({ customer_id: req.auth_context.actor_id }, {
        relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
        order: { created_at: "DESC" },
    });
    res.json({ orders: orders.map((order) => (0, serialize_1.marketplaceOrderForCustomer)(order)) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL29yZGVycy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVNBLGtCQVdDO0FBaEJELHFFQUFtRjtBQUNuRixpRUFBb0U7QUFHcEUsbURBQW1EO0FBQzVDLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM1RSxNQUFNLFdBQVcsR0FBNkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUNuRixNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxxQkFBcUIsQ0FDcEQsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFDMUM7UUFDRSxTQUFTLEVBQUUsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUM7UUFDbkUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtLQUM5QixDQUNGLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUEsdUNBQTJCLEVBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDakYsQ0FBQyJ9