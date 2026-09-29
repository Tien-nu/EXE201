"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createShipping;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function createShipping({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "currency_code"],
    });
    const regionId = regions[0]?.id;
    if (!regionId) {
        logger.error("No region found");
        return;
    }
    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name", "fulfillment_sets.id", "fulfillment_sets.service_zones.id"],
    });
    const location = stockLocations[0];
    if (!location) {
        logger.error("No stock location found");
        return;
    }
    const serviceZoneId = location.fulfillment_sets?.[0]?.service_zones?.[0]?.id;
    if (!serviceZoneId) {
        logger.error("No service zone found in fulfillment set");
        return;
    }
    const { data: sps } = await query.graph({
        entity: "shipping_profile",
        fields: ["id"],
    });
    const shippingProfileId = sps[0]?.id;
    logger.info(`Creating shipping options for Region ${regionId}, Service Zone ${serviceZoneId}, Profile ${shippingProfileId}`);
    try {
        await (0, core_flows_1.createShippingOptionsWorkflow)(container).run({
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
        });
        logger.info("Successfully created shipping options!");
    }
    catch (err) {
        logger.error("Error creating shipping options: " + err.message);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNoaXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY3JlYXRlLXNoaXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsaUNBNkdDO0FBakhELHFEQUE4RTtBQUM5RSw0REFBMkU7QUFHNUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNsRSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFbEUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQztLQUNoQyxDQUFDLENBQUE7SUFFRixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFBO0lBRS9CLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUMvQixPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ2pELE1BQU0sRUFBRSxnQkFBZ0I7UUFDeEIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxtQ0FBbUMsQ0FBQztLQUNuRixDQUFDLENBQUE7SUFFRixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2QsTUFB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