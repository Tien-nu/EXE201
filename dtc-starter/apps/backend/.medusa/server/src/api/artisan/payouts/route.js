"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const artisans_1 = require("../../../lib/marketplace/artisans");
const marketplace_1 = require("../../../modules/marketplace");
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const payouts = await marketplace.listPayouts({ artisan_id: artisan.id }, { order: { created_at: "DESC" } });
    res.json({ payouts });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vcGF5b3V0cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQVNDO0FBYkQsZ0VBQW9FO0FBQ3BFLDhEQUFpRTtBQUcxRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFdBQVcsQ0FDM0MsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUMxQixFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUNsQyxDQUFBO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkIsQ0FBQyJ9