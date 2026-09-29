"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
/** Delivered: the order completes by itself 2 days later. */
async function POST(req, res) {
    await (0, transitions_1.markDelivered)(req.scope, req.params.id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9kZWxpdmVyL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsb0JBSUM7QUFQRCwrRUFBNkU7QUFFN0UsNkRBQTZEO0FBQ3RELEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLElBQUEsMkJBQWEsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzdCLENBQUMifQ==