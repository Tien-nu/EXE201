import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function createShipping({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })

  const regionId = regions[0]?.id

  if (!regionId) {
    logger.error("No region found")
    return
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_sets.id", "fulfillment_sets.service_zones.id"],
  })

  const location = stockLocations[0]
  if (!location) {
    logger.error("No stock location found")
    return
  }

  const serviceZoneId = location.fulfillment_sets?.[0]?.service_zones?.[0]?.id

  if (!serviceZoneId) {
    logger.error("No service zone found in fulfillment set")
    return
  }

  const { data: sps } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfileId = sps[0]?.id

  logger.info(`Creating shipping options for Region ${regionId}, Service Zone ${serviceZoneId}, Profile ${shippingProfileId}`)

  try {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "Standard",
            description: "Standard delivery in 3-5 days",
            code: "standard",
          },
          prices: [
            {
              currency_code: "vnd",
              amount: 30000,
            },
            {
              region_id: regionId,
              amount: 30000,
            }
          ],
          rules: [
            {
              attribute: "is_return",
              operator: "eq",
              value: "false",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "Express",
            description: "Next day delivery",
            code: "express",
          },
          prices: [
            {
              currency_code: "vnd",
              amount: 50000,
            },
            {
              region_id: regionId,
              amount: 50000,
            }
          ],
          rules: [
            {
              attribute: "is_return",
              operator: "eq",
              value: "false",
            },
          ],
        }
      ]
    })
    logger.info("Successfully created shipping options!")
  } catch (err) {
    logger.error("Error creating shipping options: " + err.message)
  }
}
