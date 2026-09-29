"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const artisans_1 = require("../../../../lib/marketplace/artisans");
const marketplace_1 = require("../../../../modules/marketplace");
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const status = req.query.status;
    const artisans = await marketplace.listArtisans(status ? { status: status } : {}, { order: { created_at: "DESC" } });
    res.json({ artisans });
}
async function POST(req, res) {
    const artisan = await (0, artisans_1.createArtisanByAdmin)(req.scope, req.validatedBody);
    res.json({ artisan });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL2FydGlzYW5zL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsa0JBVUM7QUFFRCxvQkFPQztBQXZCRCxtRUFBMkU7QUFDM0UsaUVBQW9FO0FBRzdELEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLFdBQVcsR0FBNkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUNuRixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQTRCLENBQUE7SUFFckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ3ZDLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQ2xDLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN4QixDQUFDO0FBRU0sS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBMEMsRUFDMUMsR0FBbUI7SUFFbkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLCtCQUFvQixFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRXhFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZCLENBQUMifQ==