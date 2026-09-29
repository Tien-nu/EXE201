"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const artisans_1 = require("../../../lib/marketplace/artisans");
const serialize_1 = require("../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../modules/marketplace");
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const requests = await marketplace.listCustomRequests({ artisan_id: artisan.id }, { order: { created_at: "DESC" } });
    res.json({ custom_requests: requests.map(serialize_1.customRequestForArtisan) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vY3VzdG9tLXJlcXVlc3RzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBU0Esa0JBU0M7QUFkRCxnRUFBb0U7QUFDcEUsa0VBQTRFO0FBQzVFLDhEQUFpRTtBQUcxRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLGtCQUFrQixDQUNuRCxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQzFCLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQ2xDLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQXVCLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdEUsQ0FBQyJ9