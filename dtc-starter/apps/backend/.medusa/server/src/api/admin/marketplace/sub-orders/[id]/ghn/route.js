"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const ghn_shipping_1 = require("../../../../../../lib/marketplace/ghn-shipping");
/** Books a real GHN pickup at the artisan and marks the sub-order shipping. */
async function POST(req, res) {
    const created = await (0, ghn_shipping_1.createGhnShipment)(req.scope, req.params.id);
    res.json({ order_code: created.order_code, total_fee: created.total_fee });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3N1Yi1vcmRlcnMvW2lkXS9naG4vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQkFJQztBQVBELGlGQUFrRjtBQUVsRiwrRUFBK0U7QUFDeEUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSxnQ0FBaUIsRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFakUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtBQUM1RSxDQUFDIn0=