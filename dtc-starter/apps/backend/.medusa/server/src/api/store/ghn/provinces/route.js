"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const ghn_1 = require("../../../../lib/marketplace/ghn");
async function GET(_req, res) {
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.json({ data: await (0, ghn_1.listProvinces)() });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2dobi9wcm92aW5jZXMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxrQkFHQztBQUxELHlEQUErRDtBQUV4RCxLQUFLLFVBQVUsR0FBRyxDQUFDLElBQW1CLEVBQUUsR0FBbUI7SUFDaEUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtJQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sSUFBQSxtQkFBYSxHQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzNDLENBQUMifQ==