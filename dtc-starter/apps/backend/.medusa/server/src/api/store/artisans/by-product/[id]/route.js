"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const serialize_1 = require("../../../../../lib/marketplace/serialize");
/** Who makes a product and how it is made, for the product page. */
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [product], } = await query.graph({
        entity: "product",
        fields: ["id", "metadata", "artisan.*"],
        filters: { id: req.params.id },
    });
    const artisan = product?.artisan;
    const metadata = (product?.metadata ?? {});
    res.json({
        artisan: artisan?.status === "active" ? (0, serialize_1.publicArtisan)(artisan) : null,
        fulfillment_type: metadata.fulfillment_type === "made_to_order" ? "made_to_order" : "ready",
        lead_days: metadata.lead_days ? Number(metadata.lead_days) : null,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FydGlzYW5zL2J5LXByb2R1Y3QvW2lkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQWtCQztBQXRCRCxxREFBcUU7QUFDckUsd0VBQXdFO0FBRXhFLG9FQUFvRTtBQUM3RCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEUsTUFBTSxFQUNKLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUNoQixHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNwQixNQUFNLEVBQUUsU0FBUztRQUNqQixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQztRQUN2QyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDL0IsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxPQUFPLEdBQUksT0FBZSxFQUFFLE9BQU8sQ0FBQTtJQUN6QyxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRSxDQUE0QixDQUFBO0lBRXJFLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUEseUJBQWEsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNyRSxnQkFBZ0IsRUFDZCxRQUFRLENBQUMsZ0JBQWdCLEtBQUssZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDM0UsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7S0FDbEUsQ0FBQyxDQUFBO0FBQ0osQ0FBQyJ9