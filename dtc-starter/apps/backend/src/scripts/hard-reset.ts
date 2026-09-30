import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

export default async function hardReset({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // To perform raw SQL queries in Medusa v2, we usually resolve the Knex instance.
  // Or we can just use the internal query builder.
  const dbConfig = container.resolve<import("@medusajs/framework/mikro-orm/knex").Knex>("pgConnection")
  
  if (dbConfig) {
    try {
      await dbConfig.raw('TRUNCATE TABLE product CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_collection CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_category CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_tag CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_option CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_type CASCADE;')
      await dbConfig.raw('TRUNCATE TABLE product_variant CASCADE;')
      
      logger.info('Hard deleted all products, collections, categories, tags, options.')
    } catch (e) {
      logger.error('Failed to run raw SQL TRUNCATE: ' + e)
    }
  } else {
    logger.error('No DB connection found.')
  }
}
