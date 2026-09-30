import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'
import { deleteProductsWorkflow } from '@medusajs/medusa/core-flows'

export default async function clearMedusaProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('Deleting old Medusa demo products...')
  
  const { data: allProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'title'],
  })

  if (allProducts.length > 0) {
    const ids = allProducts.map(p => p.id as string)
    await deleteProductsWorkflow(container).run({
      input: { ids }
    })
    logger.info(`Deleted ${ids.length} products!`)
  } else {
    logger.info('No products found to delete.')
  }
}
