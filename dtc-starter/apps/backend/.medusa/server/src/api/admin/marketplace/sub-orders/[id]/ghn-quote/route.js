"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const ghn_shipping_1 = require("../../../../../../lib/marketplace/ghn-shipping");
/** GHN fee and delivery date for this sub-order; books nothing. */
async function POST(req, res) {
    res.json({ quote: await (0, ghn_shipping_1.quoteGhnShipment)(req.scope, req.params.id) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9naG4tcXVvdGUvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQkFFQztBQUxELGlGQUFpRjtBQUVqRixtRUFBbUU7QUFDNUQsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxJQUFBLCtCQUFnQixFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdkUsQ0FBQyJ9