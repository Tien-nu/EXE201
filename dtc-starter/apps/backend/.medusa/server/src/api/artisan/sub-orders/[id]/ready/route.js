"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const artisans_1 = require("../../../../../lib/marketplace/artisans");
const transitions_1 = require("../../../../../lib/marketplace/transitions");
/** "Đã làm xong – chờ giao hàng": emails the admin to book the carrier. */
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    await (0, transitions_1.markReadyToShip)(req.scope, req.params.id, artisan.id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vc3ViLW9yZGVycy9baWRdL3JlYWR5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsb0JBS0M7QUFURCxzRUFBMEU7QUFDMUUsNEVBQTRFO0FBRTVFLDJFQUEyRTtBQUNwRSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDN0UsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sSUFBQSw2QkFBZSxFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDIn0=