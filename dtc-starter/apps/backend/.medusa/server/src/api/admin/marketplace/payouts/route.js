"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const payouts_1 = require("../../../../lib/marketplace/payouts");
const marketplace_1 = require("../../../../modules/marketplace");
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const payouts = await marketplace.listPayouts({}, { relations: ["artisan"], order: { created_at: "DESC" }, take: 200 });
    res.json({ payouts });
}
/** "Tổng hợp tuần trước": the same thing the Monday job does. */
async function POST(req, res) {
    const payouts = await (0, payouts_1.generatePayouts)(req.scope);
    res.json({ created: payouts.length });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3BheW91dHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxrQkFRQztBQUdELG9CQUlDO0FBbkJELGlFQUFxRTtBQUNyRSxpRUFBb0U7QUFHN0QsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFdBQVcsQ0FDM0MsRUFBRSxFQUNGLEVBQUUsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FDckUsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZCLENBQUM7QUFFRCxpRUFBaUU7QUFDMUQsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSx5QkFBZSxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZDLENBQUMifQ==