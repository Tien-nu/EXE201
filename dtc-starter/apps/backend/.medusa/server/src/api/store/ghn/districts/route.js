"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const ghn_1 = require("../../../../lib/marketplace/ghn");
async function GET(req, res) {
    const provinceId = Number(req.query.province_id);
    if (!provinceId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Thiếu province_id");
    }
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.json({ data: await (0, ghn_1.listDistricts)(provinceId) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2dobi9kaXN0cmljdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFTQztBQVpELHFEQUF1RDtBQUN2RCx5REFBK0Q7QUFFeEQsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRWhELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixNQUFNLElBQUksbUJBQVcsQ0FBQyxtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtJQUM1RSxDQUFDO0lBRUQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtJQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sSUFBQSxtQkFBYSxFQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNyRCxDQUFDIn0=