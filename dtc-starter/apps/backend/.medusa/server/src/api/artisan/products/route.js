"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const artisan_products_1 = require("../../../lib/marketplace/artisan-products");
const artisans_1 = require("../../../lib/marketplace/artisans");
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    res.json({ products: await (0, artisan_products_1.listArtisanProducts)(req.scope, artisan.id) });
}
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const product = await (0, artisan_products_1.createArtisanProduct)(req.scope, artisan.id, req.validatedBody);
    res.json({ product });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFXQSxrQkFJQztBQUVELG9CQVFDO0FBcEJELGdGQUdrRDtBQUNsRCxnRUFBb0U7QUFFN0QsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwyQkFBZ0IsRUFBQyxHQUFHLENBQUMsQ0FBQTtJQUUzQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBQSxzQ0FBbUIsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDMUUsQ0FBQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQXlELEVBQ3pELEdBQW1CO0lBRW5CLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwyQkFBZ0IsRUFBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsdUNBQW9CLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUVwRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUN2QixDQUFDIn0=