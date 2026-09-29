"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const constants_1 = require("../../../../../lib/marketplace/constants");
const orders_1 = require("../../../../../lib/marketplace/orders");
const serialize_1 = require("../../../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../../../modules/marketplace");
const notFound = () => new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
/**
 * One order's marketplace data, by Medusa order id. The confirmation page can
 * load before the `order.placed` subscriber ran, so a fresh order is split
 * here if needed.
 */
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const customerId = req.auth_context.actor_id;
    const orderId = req.params.order_id;
    let [order] = await marketplace.listMarketplaceOrders({ order_id: orderId });
    if (!order) {
        const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        const { data: [medusaOrder], } = await query.graph({
            entity: "order",
            fields: ["id", "customer_id", "created_at"],
            filters: { id: orderId },
        });
        const isFresh = !!medusaOrder &&
            Date.now() - new Date(medusaOrder.created_at).getTime() < constants_1.HOUR;
        if (!medusaOrder || medusaOrder.customer_id !== customerId || !isFresh) {
            throw notFound();
        }
        order = (await (0, orders_1.ensureMarketplaceOrder)(req.scope, orderId)).marketplaceOrder;
    }
    if (order.customer_id !== customerId) {
        throw notFound();
    }
    const full = await marketplace.retrieveMarketplaceOrder(order.id, {
        relations: ["sub_orders", "sub_orders.items", "sub_orders.artisan"],
    });
    res.json({
        order: (0, serialize_1.marketplaceOrderForCustomer)(full, await marketplace.getSettings()),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL29yZGVycy9bb3JkZXJfaWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBbUJBLGtCQXVDQztBQXRERCxxREFBa0Y7QUFDbEYsd0VBQStEO0FBQy9ELGtFQUE4RTtBQUM5RSx3RUFBc0Y7QUFDdEYsb0VBQXVFO0FBR3ZFLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUNwQixJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLHlCQUF5QixDQUFDLENBQUE7QUFFekU7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM1RSxNQUFNLFdBQVcsR0FBNkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUNuRixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQTtJQUM1QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtJQUVuQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxXQUFXLENBQUMscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUU1RSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoRSxNQUFNLEVBQ0osSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQ3BCLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxPQUFPO1lBQ2YsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUM7WUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtTQUN6QixDQUFDLENBQUE7UUFFRixNQUFNLE9BQU8sR0FDWCxDQUFDLENBQUMsV0FBVztZQUNiLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBb0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLGdCQUFJLENBQUE7UUFFMUUsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxLQUFLLFVBQVUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZFLE1BQU0sUUFBUSxFQUFFLENBQUE7UUFDbEIsQ0FBQztRQUVELEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBQSwrQkFBc0IsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUE7SUFDN0UsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNyQyxNQUFNLFFBQVEsRUFBRSxDQUFBO0lBQ2xCLENBQUM7SUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ2hFLFNBQVMsRUFBRSxDQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQztLQUNwRSxDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsS0FBSyxFQUFFLElBQUEsdUNBQTJCLEVBQUMsSUFBSSxFQUFFLE1BQU0sV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQzFFLENBQUMsQ0FBQTtBQUNKLENBQUMifQ==