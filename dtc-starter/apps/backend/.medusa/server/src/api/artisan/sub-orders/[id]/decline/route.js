"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const artisans_1 = require("../../../../../lib/marketplace/artisans");
const transitions_1 = require("../../../../../lib/marketplace/transitions");
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    await (0, transitions_1.declineSubOrder)(req.scope, req.params.id, artisan.id, req.validatedBody.reason);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vc3ViLW9yZGVycy9baWRdL2RlY2xpbmUvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSxvQkFRQztBQVhELHNFQUEwRTtBQUMxRSw0RUFBNEU7QUFFckUsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBMkMsRUFDM0MsR0FBbUI7SUFFbkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sSUFBQSw2QkFBZSxFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRXJGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDIn0=