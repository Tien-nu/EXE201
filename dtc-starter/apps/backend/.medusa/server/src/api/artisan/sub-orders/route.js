"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const artisans_1 = require("../../../lib/marketplace/artisans");
const serialize_1 = require("../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../modules/marketplace");
/**
 * The artisan's sub-orders, optionally one status (`?status=`). Orders still
 * waiting on the customer's bank transfer are not shown yet.
 */
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const status = req.query.status;
    // Both lists in parallel: every query is a round trip to the database.
    const [subOrders, customRequests] = await Promise.all([
        marketplace.listSubOrders({ artisan_id: artisan.id, ...(status ? { status: status } : {}) }, {
            relations: ["items", "marketplace_order"],
            order: { created_at: "DESC" },
        }),
        marketplace.listCustomRequests({ artisan_id: artisan.id, status: "ordered" }),
    ]);
    const visible = subOrders.filter((sub) => sub.status !== "pending_payment" &&
        // Canceled before payment: the artisan never saw these.
        !(sub.status === "canceled" && !sub.accept_deadline && !sub.accepted_at));
    res.json({
        sub_orders: visible.map((sub) => (0, serialize_1.subOrderForArtisan)(sub, customRequests.find((request) => request.id === sub.custom_request_id))),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vc3ViLW9yZGVycy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLGtCQWdDQztBQXpDRCxnRUFBb0U7QUFDcEUsa0VBQXVFO0FBQ3ZFLDhEQUFpRTtBQUdqRTs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBNEIsQ0FBQTtJQUVyRCx1RUFBdUU7SUFDdkUsTUFBTSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDcEQsV0FBVyxDQUFDLGFBQWEsQ0FDdkIsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDeEU7WUFDRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUM7WUFDekMsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtTQUM5QixDQUNGO1FBQ0QsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO0tBQzlFLENBQUMsQ0FBQTtJQUVGLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQzlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDTixHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFpQjtRQUNoQyx3REFBd0Q7UUFDeEQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FDM0UsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQzlCLElBQUEsOEJBQWtCLEVBQ2hCLEdBQUcsRUFDSCxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUN2RSxDQUNGO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQyJ9