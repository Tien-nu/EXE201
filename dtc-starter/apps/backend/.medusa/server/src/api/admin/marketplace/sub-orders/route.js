"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const marketplace_1 = require("../../../../modules/marketplace");
/** Sub-orders by `?status=` and/or `?refund_status=pending`. */
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const { status, refund_status } = req.query;
    const subOrders = await marketplace.listSubOrders({
        ...(status ? { status: status } : {}),
        ...(refund_status ? { refund_status: refund_status } : {}),
    }, {
        relations: ["items", "artisan", "marketplace_order"],
        order: { created_at: "DESC" },
        take: 200,
    });
    res.json({ sub_orders: subOrders });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxrQkFpQkM7QUFyQkQsaUVBQW9FO0FBR3BFLGdFQUFnRTtBQUN6RCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxXQUFXLEdBQTZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7SUFDbkYsTUFBTSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBMkMsQ0FBQTtJQUVqRixNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQy9DO1FBQ0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxhQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNsRSxFQUNEO1FBQ0UsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQztRQUNwRCxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFO1FBQzdCLElBQUksRUFBRSxHQUFHO0tBQ1YsQ0FDRixDQUFBO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0FBQ3JDLENBQUMifQ==