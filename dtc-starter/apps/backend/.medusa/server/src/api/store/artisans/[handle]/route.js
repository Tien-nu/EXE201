"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const serialize_1 = require("../../../../lib/marketplace/serialize");
/** A shop and the ids of its published products; prices come from /store/products. */
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [artisan], } = await query.graph({
        entity: "artisan",
        fields: ["*", "products.id", "products.status"],
        filters: { handle: req.params.handle, status: "active" },
    });
    if (!artisan) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy gian hàng");
    }
    res.json({
        artisan: (0, serialize_1.publicArtisan)(artisan),
        product_ids: (artisan.products ?? [])
            .filter((product) => product?.status === "published")
            .map((product) => product.id),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FydGlzYW5zL1toYW5kbGVdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esa0JBb0JDO0FBeEJELHFEQUFrRjtBQUNsRixxRUFBcUU7QUFFckUsc0ZBQXNGO0FBQy9FLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoRSxNQUFNLEVBQ0osSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQ2hCLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUM7UUFDL0MsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7S0FDekQsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQUE7SUFDaEYsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxPQUFPLEVBQUUsSUFBQSx5QkFBYSxFQUFDLE9BQU8sQ0FBQztRQUMvQixXQUFXLEVBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBVzthQUM3QyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUssV0FBVyxDQUFDO2FBQ3BELEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUNoQyxDQUFDLENBQUE7QUFDSixDQUFDIn0=