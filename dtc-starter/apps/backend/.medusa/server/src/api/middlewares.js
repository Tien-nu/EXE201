"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@medusajs/framework/http");
const marketplace_1 = require("../modules/marketplace");
const marketplace_validators_1 = require("./marketplace-validators");
const body = (method, matcher, schema) => ({
    method: [method],
    matcher,
    middlewares: [(0, http_1.validateAndTransformBody)(schema)],
});
async function blockNativeFulfillment(req, res, next) {
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const [order] = await marketplace.listMarketplaceOrders({ order_id: req.params.id });
    if (!order) {
        return next();
    }
    res.status(400).json({
        type: 'not_allowed',
        message: 'Đơn của sàn được giao riêng theo từng nghệ nhân. Hãy tạo vận đơn ở Admin → Đơn sàn → "Chờ giao hàng" (sau khi nghệ nhân báo làm xong).',
    });
}
// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
exports.default = (0, http_1.defineMiddlewares)({
    routes: [
        {
            method: ['POST'],
            matcher: '/store/search',
            middlewares: [
                (0, http_1.configureStoreSearch)({
                    allowed_indexes: {
                        product: true,
                    },
                }),
            ],
        },
        // ---- Customer ---------------------------------------------------------
        {
            matcher: '/store/marketplace/*',
            middlewares: [(0, http_1.authenticate)('customer', ['session', 'bearer'])],
        },
        body('POST', '/store/marketplace/custom-requests', marketplace_validators_1.CreateCustomRequestSchema),
        body('POST', '/store/marketplace/custom-requests/:id/decide', marketplace_validators_1.DecideCustomRequestSchema),
        // ---- Artisan ----------------------------------------------------------
        {
            // Right after sign-up the token has no artisan yet.
            method: ['POST'],
            matcher: '/artisan/register',
            middlewares: [
                (0, http_1.authenticate)('artisan', ['bearer'], { allowUnregistered: true }),
                (0, http_1.validateAndTransformBody)(marketplace_validators_1.ArtisanProfileSchema),
            ],
        },
        {
            matcher: /^\/artisan\/(?!register).*/,
            middlewares: [(0, http_1.authenticate)('artisan', ['bearer'])],
        },
        body('POST', '/artisan/me', marketplace_validators_1.ArtisanProfileUpdateSchema),
        body('POST', '/artisan/products', marketplace_validators_1.CreateArtisanProductSchema),
        body('POST', '/artisan/products/:id', marketplace_validators_1.UpdateArtisanProductSchema),
        {
            method: ['POST'],
            matcher: '/artisan/uploads',
            bodyParser: { sizeLimit: '20mb' },
            middlewares: [(0, http_1.validateAndTransformBody)(marketplace_validators_1.UploadSchema)],
        },
        body('POST', '/artisan/sub-orders/:id/decline', marketplace_validators_1.ReasonSchema),
        body('POST', '/artisan/custom-requests/:id/respond', marketplace_validators_1.RespondCustomRequestSchema),
        // ---- Admin (already authenticated by Medusa) --------------------------
        body('POST', '/admin/marketplace/artisans', marketplace_validators_1.AdminCreateArtisanSchema),
        body('POST', '/admin/marketplace/artisans/:id/status', marketplace_validators_1.ArtisanStatusSchema),
        body('POST', '/admin/marketplace/orders/:id/reject-payment', marketplace_validators_1.OptionalReasonSchema),
        body('POST', '/admin/marketplace/sub-orders/:id/ship', marketplace_validators_1.ShipSchema),
        body('POST', '/admin/marketplace/sub-orders/:id/cancel', marketplace_validators_1.ReasonSchema),
        body('POST', '/admin/marketplace/payouts/:id/paid', marketplace_validators_1.PayoutPaidSchema),
        body('POST', '/admin/marketplace/settings', marketplace_validators_1.SettingsSchema),
        // Marketplace orders ship per artisan from Admin → Đơn sàn; Medusa's own
        // Create Fulfillment would ship every artisan's items as one parcel.
        {
            method: ['POST'],
            matcher: '/admin/orders/:id/fulfillments',
            middlewares: [blockNativeFulfillment],
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21pZGRsZXdhcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBUWlDO0FBQ2pDLHdEQUEyRDtBQUUzRCxxRUFnQmlDO0FBRWpDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBYyxFQUFFLE9BQWUsRUFBRSxNQUFzRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNoQixPQUFPO0lBQ1AsV0FBVyxFQUFFLENBQUMsSUFBQSwrQkFBd0IsRUFBQyxNQUFNLENBQUMsQ0FBQztDQUNoRCxDQUFDLENBQUE7QUFFRixLQUFLLFVBQVUsc0JBQXNCLENBQ25DLEdBQWtCLEVBQ2xCLEdBQW1CLEVBQ25CLElBQXdCO0lBRXhCLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ25GLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFcEYsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1gsT0FBTyxJQUFJLEVBQUUsQ0FBQTtJQUNmLENBQUM7SUFFRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuQixJQUFJLEVBQUUsYUFBYTtRQUNuQixPQUFPLEVBQ0wsd0lBQXdJO0tBQzNJLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCw2RUFBNkU7QUFDN0UsMEVBQTBFO0FBQzFFLGtCQUFlLElBQUEsd0JBQWlCLEVBQUM7SUFDL0IsTUFBTSxFQUFFO1FBQ047WUFDRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDaEIsT0FBTyxFQUFFLGVBQWU7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