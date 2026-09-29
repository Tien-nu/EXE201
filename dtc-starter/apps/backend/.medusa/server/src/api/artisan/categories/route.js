"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const artisans_1 = require("../../../lib/marketplace/artisans");
/** Categories an artisan can file products under. */
async function GET(req, res) {
    await (0, artisans_1.getAuthedArtisan)(req);
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "product_category",
        fields: ["id", "name"],
        filters: { is_active: true },
    });
    res.json({ categories: data });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vY2F0ZWdvcmllcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQVVDO0FBZEQscURBQXFFO0FBQ3JFLGdFQUFvRTtBQUVwRSxxREFBcUQ7QUFDOUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sSUFBQSwyQkFBZ0IsRUFBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztRQUN0QixPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO0tBQzdCLENBQUMsQ0FBQTtJQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNoQyxDQUFDIn0=