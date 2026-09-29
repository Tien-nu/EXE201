"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
/** The money never arrived: cancel the order. */
async function POST(req, res) {
    await (0, transitions_1.rejectPayment)(req.scope, req.params.id, req.validatedBody.reason ?? undefined);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL29yZGVycy9baWRdL3JlamVjdC1wYXltZW50L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esb0JBT0M7QUFWRCwrRUFBNkU7QUFFN0UsaURBQWlEO0FBQzFDLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQXNDLEVBQ3RDLEdBQW1CO0lBRW5CLE1BQU0sSUFBQSwyQkFBYSxFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUE7SUFFcEYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzdCLENBQUMifQ==