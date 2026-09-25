import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

export default async function checkPrice({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const variantId = "variant_01M3BAPC8PF8Q0MPPAVXM2N4DK"
  
  const { data: variants } = await query.graph({
    entity: 'variant',
    fields: ['id', 'title', 'prices.*'],
    filters: {
      id: variantId
    }
  })
  
  console.log("Variant details:", JSON.stringify(variants, null, 2))
  
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code']
  })
  
  console.log("Regions in DB:", JSON.stringify(regions, null, 2))
}
