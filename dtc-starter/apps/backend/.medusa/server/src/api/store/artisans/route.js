"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const serialize_1 = require("../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../modules/marketplace");
/** Active shops, for the "Nghệ nhân" listing. */
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const artisans = await marketplace.listArtisans({ status: "active" }, { order: { shop_name: "ASC" } });
    res.json({ artisans: artisans.map(serialize_1.publicArtisan) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FydGlzYW5zL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsa0JBUUM7QUFiRCxrRUFBa0U7QUFDbEUsOERBQWlFO0FBR2pFLGlEQUFpRDtBQUMxQyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxXQUFXLEdBQTZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7SUFDbkYsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUM3QyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFDcEIsRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FDaEMsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3JELENBQUMifQ==