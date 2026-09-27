import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import {
  AdminCreateArtisanSchema,
  ArtisanProfileSchema,
  ArtisanProfileUpdateSchema,
  ArtisanStatusSchema,
  CreateArtisanProductSchema,
  CreateCustomRequestSchema,
  DecideCustomRequestSchema,
  OptionalReasonSchema,
  PayoutPaidSchema,
  ReasonSchema,
  RespondCustomRequestSchema,
  SettingsSchema,
  ShipSchema,
  UpdateArtisanProductSchema,
  UploadSchema,
} from './marketplace-validators'

const body = (method: 'POST', matcher: string, schema: Parameters<typeof validateAndTransformBody>[0]) => ({
  method: [method],
  matcher,
  middlewares: [validateAndTransformBody(schema)],
})

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },

    // ---- Customer ---------------------------------------------------------
    {
      matcher: '/store/marketplace/*',
      middlewares: [authenticate('customer', ['session', 'bearer'])],
    },
    body('POST', '/store/marketplace/custom-requests', CreateCustomRequestSchema),
    body('POST', '/store/marketplace/custom-requests/:id/decide', DecideCustomRequestSchema),

    // ---- Artisan ----------------------------------------------------------
    {
      // Right after sign-up the token has no artisan yet.
      method: ['POST'],
      matcher: '/artisan/register',
      middlewares: [
        authenticate('artisan', ['bearer'], { allowUnregistered: true }),
        validateAndTransformBody(ArtisanProfileSchema),
      ],
    },
    {
      matcher: /^\/artisan\/(?!register).*/,
      middlewares: [authenticate('artisan', ['bearer'])],
    },
    body('POST', '/artisan/me', ArtisanProfileUpdateSchema),
    body('POST', '/artisan/products', CreateArtisanProductSchema),
    body('POST', '/artisan/products/:id', UpdateArtisanProductSchema),
    {
      method: ['POST'],
      matcher: '/artisan/uploads',
      bodyParser: { sizeLimit: '20mb' },
      middlewares: [validateAndTransformBody(UploadSchema)],
    },
    body('POST', '/artisan/sub-orders/:id/decline', ReasonSchema),
    body('POST', '/artisan/custom-requests/:id/respond', RespondCustomRequestSchema),

    // ---- Admin (already authenticated by Medusa) --------------------------
    body('POST', '/admin/marketplace/artisans', AdminCreateArtisanSchema),
    body('POST', '/admin/marketplace/artisans/:id/status', ArtisanStatusSchema),
    body('POST', '/admin/marketplace/orders/:id/reject-payment', OptionalReasonSchema),
    body('POST', '/admin/marketplace/sub-orders/:id/ship', ShipSchema),
    body('POST', '/admin/marketplace/sub-orders/:id/cancel', ReasonSchema),
    body('POST', '/admin/marketplace/payouts/:id/paid', PayoutPaidSchema),
    body('POST', '/admin/marketplace/settings', SettingsSchema),
  ],
})
