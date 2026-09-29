"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const payouts_1 = require("../../../../../../lib/marketplace/payouts");
async function POST(req, res) {
    const payout = await (0, payouts_1.markPayoutPaid)(req.scope, req.params.id, req.validatedBody.transaction_ref);
    res.json({ payout });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3BheW91dHMvW2lkXS9wYWlkL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsb0JBUUM7QUFWRCx1RUFBMEU7QUFFbkUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQyxFQUFFLEdBQW1CO0lBQ2hGLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx3QkFBYyxFQUNqQyxHQUFHLENBQUMsS0FBSyxFQUNULEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUNiLEdBQUcsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUNsQyxDQUFBO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7QUFDdEIsQ0FBQyJ9