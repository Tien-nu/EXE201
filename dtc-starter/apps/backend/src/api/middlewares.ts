import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/framework/http'
import { MARKETPLACE_MODULE } from '../modules/marketplace'
import type MarketplaceModuleService from '../modules/marketplace/service'
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

async function blockNativeFulfillment(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const [order] = await marketplace.listMarketplaceOrders({ order_id: req.params.id })

  if (!order) {
    return next()
  }

  res.status(400).json({
    type: 'not_allowed',
    message:
      'Đơn của sàn được giao riêng theo từng nghệ nhân. Hãy tạo vận đơn ở Admin → Đơn sàn → "Chờ giao hàng" (sau khi nghệ nhân báo làm xong).',
  })
}

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

    // Marketplace orders ship per artisan from Admin → Đơn sàn; Medusa's own
    // Create Fulfillment would ship every artisan's items as one parcel.
    {
      method: ['POST'],
      matcher: '/admin/orders/:id/fulfillments',
      middlewares: [blockNativeFulfillment],
    },
  ],
})
