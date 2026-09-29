"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
/** The admin booked the carrier: record carrier and tracking number. */
async function POST(req, res) {
    await (0, transitions_1.shipSubOrder)(req.scope, req.params.id, req.validatedBody);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9zaGlwL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esb0JBSUM7QUFQRCwrRUFBNEU7QUFFNUUsd0VBQXdFO0FBQ2pFLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBNEIsRUFBRSxHQUFtQjtJQUMxRSxNQUFNLElBQUEsMEJBQVksRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUUvRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDN0IsQ0FBQyJ9