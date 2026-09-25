import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

export default async function myScript({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: inventoryItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id', 'location_levels.location_id'],
  })
  console.log(JSON.stringify(inventoryItems, null, 2))
}
