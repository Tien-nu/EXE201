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

    // ---- Intercept Medusa Core Fulfillment Delivery ----
    {
      method: ['POST'],
      matcher: '/admin/orders/:id/fulfillments/:fulfillment_id/mark-as-delivered',
      middlewares: [
        (req: any, res: any, next: any) => {
          res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                // Extract orderId or fulfillmentId from URL safely
                let orderId = req.params?.id
                let fulfillmentId = req.params?.fulfillment_id

                const urlMatchOrder = (req.originalUrl || req.url).match(/\/admin\/orders\/([^\/]+)\/fulfillments\/([^\/]+)/)
                if (urlMatchOrder) {
                  orderId = urlMatchOrder[1]
                  fulfillmentId = urlMatchOrder[2]
                } else {
                  const urlMatchFulf = (req.originalUrl || req.url).match(/\/admin\/fulfillments\/([^\/]+)/)
                  if (urlMatchFulf) {
                    fulfillmentId = urlMatchFulf[1]
                  }
                }

                const container = req.scope
                const logger = container.resolve('logger')
                const query = container.resolve('query')
                
                if (!orderId && fulfillmentId) {
                  const { data: fulfillments } = await query.graph({
                    entity: 'fulfillment',
                    fields: ['order_id'],
                    filters: { id: fulfillmentId }
                  })
                  orderId = fulfillments?.[0]?.order_id
                }

                if (!orderId) {
                  return
                }
                
                const { data: mpos } = await query.graph({
                  entity: 'marketplace_order',
                  fields: ['id', 'sub_orders.*'],
                  filters: { order_id: orderId }
                })
                
                const subOrders = mpos?.[0]?.sub_orders || []

                const marketplaceModule = container.resolve('marketplace') as any
                if (marketplaceModule && subOrders.length > 0) {
                  const now = new Date()
                  for (const sub of subOrders) {
                    if (sub.status !== 'delivered' && sub.status !== 'completed') {
                      await marketplaceModule.updateSubOrders([{
                        id: sub.id,
                        status: 'delivered',
                        delivered_at: now,
                        complete_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
                      }])
                      logger.info(`[Middleware] Đồng bộ SubOrder ${sub.id} thành delivered`)
                    }
                  }
                }
              } catch (e: any) {
                console.error('Lỗi khi đồng bộ SubOrder trong middleware:', e.message)
              }
            }
          })
          next()
        }
      ]
    },
    // ---- Intercept Medusa Core Fulfillment Shipment ----
    {
      method: ['POST'],
      matcher: '/admin/orders/:id/fulfillments/:fulfillment_id/shipments',
      middlewares: [
        (req: any, res: any, next: any) => {
          res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                // Extract orderId or fulfillmentId from URL safely
                let orderId = req.params?.id
                let fulfillmentId = req.params?.fulfillment_id

                const urlMatchOrder = (req.originalUrl || req.url).match(/\/admin\/orders\/([^\/]+)\/fulfillments\/([^\/]+)/)
                if (urlMatchOrder) {
                  orderId = urlMatchOrder[1]
                  fulfillmentId = urlMatchOrder[2]
                } else {
                  const urlMatchFulf = (req.originalUrl || req.url).match(/\/admin\/fulfillments\/([^\/]+)/)
                  if (urlMatchFulf) {
                    fulfillmentId = urlMatchFulf[1]
                  }
                }

                const container = req.scope
                const logger = container.resolve('logger')
                const query = container.resolve('query')
                
                if (!orderId && fulfillmentId) {
                  const { data: fulfillments } = await query.graph({
                    entity: 'fulfillment',
                    fields: ['order_id'],
                    filters: { id: fulfillmentId }
                  })
                  orderId = fulfillments?.[0]?.order_id
                }

                if (!orderId) {
                  return
                }
                
                const { data: mpos } = await query.graph({
                  entity: 'marketplace_order',
                  fields: ['id', 'sub_orders.*'],
                  filters: { order_id: orderId }
                })
                
                const subOrders = mpos?.[0]?.sub_orders || []

                const marketplaceModule = container.resolve('marketplace') as any
                if (marketplaceModule && subOrders.length > 0) {
                  const now = new Date()
                  for (const sub of subOrders) {
                    if (sub.status !== 'shipping' && sub.status !== 'delivered' && sub.status !== 'completed') {
                      await marketplaceModule.updateSubOrders([{
                        id: sub.id,
                        status: 'shipping',
                        shipped_at: now
                      }])
                      logger.info(`[Middleware] Đồng bộ SubOrder ${sub.id} thành shipping`)
                    }
                  }
                }
              } catch (e: any) {
                console.error('Lỗi khi đồng bộ SubOrder trong middleware:', e.message)
              }
            }
          })
          next()
        }
      ]
    }
  ],
})
