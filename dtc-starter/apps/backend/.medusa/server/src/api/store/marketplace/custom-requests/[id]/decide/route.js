"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const custom_requests_1 = require("../../../../../../lib/marketplace/custom-requests");
/** Accept (puts it in the cart at the quoted price) or decline the quote. */
async function POST(req, res) {
    const request = await (0, custom_requests_1.decideCustomRequest)(req.scope, req.auth_context.actor_id, req.params.id, req.validatedBody);
    res.json({ custom_request: request });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL2N1c3RvbS1yZXF1ZXN0cy9baWRdL2RlY2lkZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLG9CQVlDO0FBZkQsdUZBQXVGO0FBRXZGLDZFQUE2RTtBQUN0RSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUF3RCxFQUN4RCxHQUFtQjtJQUVuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEscUNBQW1CLEVBQ3ZDLEdBQUcsQ0FBQyxLQUFLLEVBQ1QsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQ3pCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUNiLEdBQUcsQ0FBQyxhQUFhLENBQ2xCLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkMsQ0FBQyJ9