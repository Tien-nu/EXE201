"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const artisans_1 = require("../../../lib/marketplace/artisans");
const numbers_1 = require("../../../lib/marketplace/numbers");
const marketplace_1 = require("../../../modules/marketplace");
/** Counters for the portal home page. */
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const [subOrders, pendingRequests, payouts] = await Promise.all([
        marketplace.listSubOrders({ artisan_id: artisan.id }),
        marketplace.listCustomRequests({ artisan_id: artisan.id, status: "pending" }),
        marketplace.listPayouts({ artisan_id: artisan.id }),
    ]);
    const byStatus = {};
    for (const subOrder of subOrders) {
        byStatus[subOrder.status] = (byStatus[subOrder.status] ?? 0) + 1;
    }
    const completed = subOrders.filter((sub) => sub.status === "completed");
    res.json({
        sub_orders_by_status: byStatus,
        pending_custom_requests: pendingRequests.length,
        revenue: {
            completed_total: completed.reduce((sum, sub) => sum + (0, numbers_1.toNumber)(sub.subtotal), 0),
            awaiting_payout: completed
                .filter((sub) => !sub.payout_id)
                .reduce((sum, sub) => sum + (0, numbers_1.toNumber)(sub.subtotal), 0),
            pending_payout: payouts
                .filter((payout) => payout.status === "pending")
                .reduce((sum, payout) => sum + (0, numbers_1.toNumber)(payout.net_amount), 0),
            paid_out: payouts
                .filter((payout) => payout.status === "paid")
                .reduce((sum, payout) => sum + (0, numbers_1.toNumber)(payout.net_amount), 0),
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vZGFzaGJvYXJkL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsa0JBa0NDO0FBeENELGdFQUFvRTtBQUNwRSw4REFBMkQ7QUFDM0QsOERBQWlFO0FBR2pFLHlDQUF5QztBQUNsQyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBRW5GLE1BQU0sQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM5RCxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNyRCxXQUFXLENBQUMsa0JBQWtCLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDN0UsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7S0FDcEQsQ0FBQyxDQUFBO0lBRUYsTUFBTSxRQUFRLEdBQTJCLEVBQUUsQ0FBQTtJQUUzQyxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNsRSxDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQTtJQUV2RSxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1Asb0JBQW9CLEVBQUUsUUFBUTtRQUM5Qix1QkFBdUIsRUFBRSxlQUFlLENBQUMsTUFBTTtRQUMvQyxPQUFPLEVBQUU7WUFDUCxlQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFBLGtCQUFRLEVBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRixlQUFlLEVBQUUsU0FBUztpQkFDdkIsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7aUJBQy9CLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFBLGtCQUFRLEVBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RCxjQUFjLEVBQUUsT0FBTztpQkFDcEIsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQztpQkFDL0MsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUEsa0JBQVEsRUFBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLFFBQVEsRUFBRSxPQUFPO2lCQUNkLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUM7aUJBQzVDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFBLGtCQUFRLEVBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNqRTtLQUNGLENBQUMsQ0FBQTtBQUNKLENBQUMifQ==