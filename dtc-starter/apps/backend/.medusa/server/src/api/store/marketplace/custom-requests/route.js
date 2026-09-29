"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const custom_requests_1 = require("../../../../lib/marketplace/custom-requests");
const serialize_1 = require("../../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../../modules/marketplace");
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const requests = await marketplace.listCustomRequests({ customer_id: req.auth_context.actor_id }, { relations: ["artisan"], order: { created_at: "DESC" } });
    res.json({ custom_requests: requests.map(serialize_1.customRequestForCustomer) });
}
async function POST(req, res) {
    const request = await (0, custom_requests_1.createCustomRequest)(req.scope, req.auth_context.actor_id, req.validatedBody);
    res.json({ custom_request: request });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL2N1c3RvbS1yZXF1ZXN0cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLGtCQVFDO0FBRUQsb0JBV0M7QUExQkQsaUZBQWlGO0FBQ2pGLHFFQUFnRjtBQUNoRixpRUFBb0U7QUFHN0QsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLGtCQUFrQixDQUNuRCxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUMxQyxFQUFFLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUMxRCxDQUFBO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUFFTSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUF3RCxFQUN4RCxHQUFtQjtJQUVuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEscUNBQW1CLEVBQ3ZDLEdBQUcsQ0FBQyxLQUFLLEVBQ1QsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQ3pCLEdBQUcsQ0FBQyxhQUFhLENBQ2xCLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkMsQ0FBQyJ9