"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const ghn_1 = require("../../../../lib/marketplace/ghn");
const marketplace_1 = require("../../../../modules/marketplace");
async function GET(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    res.json({
        settings: await marketplace.getSettings(),
        ghn_enabled: (0, ghn_1.isGhnConfigured)(),
    });
}
/** Platform fee (0% for now), admin Gmail and Yarnly's receiving account. */
async function POST(req, res) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const settings = await marketplace.getSettings();
    const { admin_email, ...rest } = req.validatedBody;
    const updated = await marketplace.updateMarketplaceSettings({
        id: settings.id,
        ...rest,
        admin_email: admin_email || null,
    });
    res.json({ settings: updated });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL3NldHRpbmdzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsa0JBT0M7QUFHRCxvQkFZQztBQTFCRCx5REFBaUU7QUFDakUsaUVBQW9FO0FBRzdELEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLFdBQVcsR0FBNkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtJQUVuRixHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDLFdBQVcsRUFBRTtRQUN6QyxXQUFXLEVBQUUsSUFBQSxxQkFBZSxHQUFFO0tBQy9CLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCw2RUFBNkU7QUFDdEUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFnQyxFQUFFLEdBQW1CO0lBQzlFLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2hELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFBO0lBRWxELE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLHlCQUF5QixDQUFDO1FBQzFELEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRTtRQUNmLEdBQUcsSUFBSTtRQUNQLFdBQVcsRUFBRSxXQUFXLElBQUksSUFBSTtLQUNqQyxDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDakMsQ0FBQyJ9