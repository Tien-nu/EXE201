"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const artisans_1 = require("../../../lib/marketplace/artisans");
/**
 * Second step of sign-up: the token comes from
 * POST /auth/artisan/emailpass/register and has no artisan yet.
 */
async function POST(req, res) {
    if (req.auth_context?.actor_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Tài khoản này đã có gian hàng");
    }
    const artisan = await (0, artisans_1.registerArtisan)(req.scope, req.auth_context.auth_identity_id, req.validatedBody);
    res.json({ artisan });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vcmVnaXN0ZXIvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFZQSxvQkFrQkM7QUExQkQscURBQXVEO0FBRXZELGdFQUFtRTtBQUVuRTs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUFtRCxFQUNuRCxHQUFtQjtJQUVuQixJQUFJLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDL0IsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFDN0IsK0JBQStCLENBQ2hDLENBQUE7SUFDSCxDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDBCQUFlLEVBQ25DLEdBQUcsQ0FBQyxLQUFLLEVBQ1QsR0FBRyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFDakMsR0FBRyxDQUFDLGFBQWEsQ0FDbEIsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZCLENBQUMifQ==