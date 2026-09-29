"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const artisans_1 = require("../../../lib/marketplace/artisans");
const marketplace_1 = require("../../../modules/marketplace");
/** The artisan's own account, readable in any status (e.g. while pending). */
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req, { requireActive: false });
    res.json({ artisan });
}
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req, { requireActive: false });
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const updated = await marketplace.updateArtisans({
        id: artisan.id,
        ...req.validatedBody,
    });
    res.json({ artisan: updated });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vbWUvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSxrQkFJQztBQUVELG9CQWFDO0FBeEJELGdFQUFvRTtBQUNwRSw4REFBaUU7QUFHakUsOEVBQThFO0FBQ3ZFLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM1RSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsMkJBQWdCLEVBQUMsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFFckUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkIsQ0FBQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQXlELEVBQ3pELEdBQW1CO0lBRW5CLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwyQkFBZ0IsRUFBQyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNyRSxNQUFNLFdBQVcsR0FBNkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUVuRixNQUFNLE9BQU8sR0FBRyxNQUFNLFdBQVcsQ0FBQyxjQUFjLENBQUM7UUFDL0MsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ2QsR0FBRyxHQUFHLENBQUMsYUFBYTtLQUNyQixDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDaEMsQ0FBQyJ9