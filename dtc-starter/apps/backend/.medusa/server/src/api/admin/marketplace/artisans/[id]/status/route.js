"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const artisans_1 = require("../../../../../../lib/marketplace/artisans");
/** Approve (active), reject, lock, or unlock (active again) a shop. */
async function POST(req, res) {
    const artisan = await (0, artisans_1.setArtisanStatus)(req.scope, req.params.id, req.validatedBody.status, req.validatedBody.reason);
    res.json({ artisan });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL2FydGlzYW5zL1tpZF0vc3RhdHVzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esb0JBWUM7QUFmRCx5RUFBNkU7QUFFN0UsdUVBQXVFO0FBQ2hFLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQXFDLEVBQ3JDLEdBQW1CO0lBRW5CLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwyQkFBZ0IsRUFDcEMsR0FBRyxDQUFDLEtBQUssRUFDVCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFDYixHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFDeEIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQ3pCLENBQUE7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUN2QixDQUFDIn0=