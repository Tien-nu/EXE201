"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
async function POST(req, res) {
    await (0, transitions_1.customerCancelSubOrder)(req.scope, req.params.id, req.auth_context.actor_id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9jYW5jZWwvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxvQkFJQztBQU5ELCtFQUFzRjtBQUUvRSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDN0UsTUFBTSxJQUFBLG9DQUFzQixFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUVqRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDN0IsQ0FBQyJ9