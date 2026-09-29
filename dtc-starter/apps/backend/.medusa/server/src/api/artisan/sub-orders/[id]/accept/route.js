"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const artisans_1 = require("../../../../../lib/marketplace/artisans");
const transitions_1 = require("../../../../../lib/marketplace/transitions");
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    await (0, transitions_1.acceptSubOrder)(req.scope, req.params.id, artisan.id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vc3ViLW9yZGVycy9baWRdL2FjY2VwdC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLG9CQUtDO0FBUkQsc0VBQTBFO0FBQzFFLDRFQUEyRTtBQUVwRSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDN0UsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sSUFBQSw0QkFBYyxFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTFELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDIn0=