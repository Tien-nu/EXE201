import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

export default async function setupVND({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const storeModule = container.resolve(Modules.STORE)
  const regionModule = container.resolve(Modules.REGION)
  const pricingModule = container.resolve(Modules.PRICING)
  const productModule = container.resolve(Modules.PRODUCT)

  // 1. Update Store
  const { data: stores } = await query.graph({
    entity: 'store',
    fields: ['id']
  })
  
  if (stores[0]) {
    logger.info(`Updating store ${stores[0].id}...`)
    await storeModule.updateStores([{
      id: stores[0].id,
      supported_currencies: [{ currency_code: 'vnd', is_default: true }]
    }])
  }

  // 2. Update Region
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id']
  })

  if (regions[0]) {
    logger.info(`Updating region ${regions[0].id}...`)
    await regionModule.updateRegions([{
      id: regions[0].id,
      name: 'Vietnam',
      currency_code: 'vnd',
      countries: ['vn']
    }])
  }

  logger.info(`Done updating store and region.`)
}
