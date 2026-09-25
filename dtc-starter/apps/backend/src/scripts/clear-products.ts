import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'
import { deleteProductsWorkflow } from '@medusajs/medusa/core-flows'

export default async function clearProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('Bắt đầu xoá toàn bộ sản phẩm cũ...')
  
  const { data: allProducts } = await query.graph({
    entity: 'product',
    fields: ['id'],
  })

  if (allProducts.length > 0) {
    const ids = allProducts.map(p => p.id as string)
    await deleteProductsWorkflow(container).run({
      input: ids
    })
    logger.info(`Đã xoá thành công ${ids.length} sản phẩm cũ!`)
  } else {
    logger.info('Không có sản phẩm nào để xoá.')
  }
}
