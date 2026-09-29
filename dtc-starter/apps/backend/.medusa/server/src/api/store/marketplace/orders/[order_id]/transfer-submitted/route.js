"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
const marketplace_1 = require("../../../../../../modules/marketplace");
/** The customer pressed "Tôi đã chuyển khoản". */
async function POST(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const [order] = await marketplace.listMarketplaceOrders({
        order_id: req.params.order_id,
        customer_id: req.auth_context.actor_id,
    });
    if (!order) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
    }
    await (0, transitions_1.submitTransfer)(req.scope, order.id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL29yZGVycy9bb3JkZXJfaWRdL3RyYW5zZmVyLXN1Ym1pdHRlZC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLG9CQWNDO0FBcEJELHFEQUF1RDtBQUN2RCwrRUFBOEU7QUFDOUUsdUVBQTBFO0FBRzFFLGtEQUFrRDtBQUMzQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDN0UsTUFBTSxXQUFXLEdBQTZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7SUFDbkYsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLHFCQUFxQixDQUFDO1FBQ3RELFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVE7UUFDN0IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUTtLQUN2QyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksbUJBQVcsQ0FBQyxtQkFBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUseUJBQXlCLENBQUMsQ0FBQTtJQUMvRSxDQUFDO0lBRUQsTUFBTSxJQUFBLDRCQUFjLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFekMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzdCLENBQUMifQ==