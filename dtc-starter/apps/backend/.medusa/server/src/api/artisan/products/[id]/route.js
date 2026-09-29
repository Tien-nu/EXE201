"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
const artisan_products_1 = require("../../../../lib/marketplace/artisan-products");
const artisans_1 = require("../../../../lib/marketplace/artisans");
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    res.json({
        product: await (0, artisan_products_1.getArtisanProduct)(req.scope, artisan.id, req.params.id),
    });
}
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const product = await (0, artisan_products_1.updateArtisanProduct)(req.scope, artisan.id, req.params.id, req.validatedBody);
    res.json({ product });
}
async function DELETE(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    await (0, artisan_products_1.deleteArtisanProduct)(req.scope, artisan.id, req.params.id);
    res.json({ id: req.params.id, deleted: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vcHJvZHVjdHMvW2lkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVlBLGtCQU1DO0FBRUQsb0JBYUM7QUFFRCx3QkFLQztBQW5DRCxtRkFJcUQ7QUFDckQsbUVBQXVFO0FBRWhFLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM1RSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsMkJBQWdCLEVBQUMsR0FBRyxDQUFDLENBQUE7SUFFM0MsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLE9BQU8sRUFBRSxNQUFNLElBQUEsb0NBQWlCLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQ3ZFLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFTSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUF5RCxFQUN6RCxHQUFtQjtJQUVuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsMkJBQWdCLEVBQUMsR0FBRyxDQUFDLENBQUE7SUFDM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHVDQUFvQixFQUN4QyxHQUFHLENBQUMsS0FBSyxFQUNULE9BQU8sQ0FBQyxFQUFFLEVBQ1YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQ2IsR0FBRyxDQUFDLGFBQWEsQ0FDbEIsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZCLENBQUM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDL0UsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sSUFBQSx1Q0FBb0IsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUVoRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2hELENBQUMifQ==