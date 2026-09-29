"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const ghn_shipping_1 = require("../../../lib/marketplace/ghn-shipping");
/**
 * Status callback from GHN. Register it in the GHN dashboard as
 *   https://<backend-domain>/ghn/webhook?token=<GHN_WEBHOOK_TOKEN>
 * GHN does not sign its requests, so the shared token is what keeps anyone
 * else from marking orders delivered.
 */
async function POST(req, res) {
    const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const expected = process.env.GHN_WEBHOOK_TOKEN;
    if (!expected) {
        logger.warn("[ghn] webhook rejected: GHN_WEBHOOK_TOKEN is not set");
        return res.status(401).json({ success: false, message: "Webhook is not configured" });
    }
    if (req.query.token !== expected) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
    try {
        const result = await (0, ghn_shipping_1.handleGhnStatus)(req.scope, req.body);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        logger.error(`[ghn] webhook failed: ${error.message}`);
        // 5xx makes GHN retry later.
        res.status(500).json({ success: false, message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2dobi93ZWJob29rL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsb0JBcUJDO0FBOUJELHFEQUFxRTtBQUNyRSx3RUFBdUU7QUFFdkU7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQTtJQUU5QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUE7UUFDbkUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQTtJQUN2RixDQUFDO0lBRUQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQTtJQUMzRSxDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLDhCQUFlLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBMkIsQ0FBQyxDQUFBO1FBQ2hGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUEwQixLQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUNqRSw2QkFBNkI7UUFDN0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRyxLQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM3RSxDQUFDO0FBQ0gsQ0FBQyJ9