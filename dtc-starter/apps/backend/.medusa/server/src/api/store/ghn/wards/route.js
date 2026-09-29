"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const ghn_1 = require("../../../../lib/marketplace/ghn");
async function GET(req, res) {
    const districtId = Number(req.query.district_id);
    if (!districtId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Thiếu district_id");
    }
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.json({ data: await (0, ghn_1.listWards)(districtId) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2dobi93YXJkcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQVNDO0FBWkQscURBQXVEO0FBQ3ZELHlEQUEyRDtBQUVwRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFaEQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFBO0lBQzVFLENBQUM7SUFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFBO0lBQ3ZELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxJQUFBLGVBQVMsRUFBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDakQsQ0FBQyJ9