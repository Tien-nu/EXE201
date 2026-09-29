"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const marketplace_1 = require("../../../../modules/marketplace");
/** Marketplace orders, e.g. `?payment_status=transfer_submitted` to check the bank. */
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const paymentStatus = req.query.payment_status;
    const orders = await marketplace.listMarketplaceOrders(paymentStatus ? { payment_status: paymentStatus } : {}, {
        relations: ["sub_orders", "sub_orders.artisan"],
        order: { created_at: "DESC" },
        take: 200,
    });
    res.json({ orders });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL29yZGVycy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQWNDO0FBbEJELGlFQUFvRTtBQUdwRSx1RkFBdUY7QUFDaEYsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBK0MsQ0FBQTtJQUUvRSxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxxQkFBcUIsQ0FDcEQsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsRUFBRSxhQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDN0Q7UUFDRSxTQUFTLEVBQUUsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUM7UUFDL0MsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtRQUM3QixJQUFJLEVBQUUsR0FBRztLQUNWLENBQ0YsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ3RCLENBQUMifQ==