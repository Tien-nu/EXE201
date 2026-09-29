"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
async function POST(req, res) {
    await (0, transitions_1.cancelSubOrder)(req.scope, req.params.id, "admin", req.validatedBody.reason);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9jYW5jZWwvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQkFJQztBQU5ELCtFQUE4RTtBQUV2RSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQThCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxJQUFBLDRCQUFjLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVqRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDN0IsQ0FBQyJ9