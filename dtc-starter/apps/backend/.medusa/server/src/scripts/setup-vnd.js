"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupVND;
const utils_1 = require("@medusajs/framework/utils");
async function setupVND({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const storeModule = container.resolve(utils_1.Modules.STORE);
    const regionModule = container.resolve(utils_1.Modules.REGION);
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    const productModule = container.resolve(utils_1.Modules.PRODUCT);
    // 1. Update Store
    const { data: stores } = await query.graph({
        entity: 'store',
        fields: ['id']
    });
    if (stores[0]) {
        logger.info(`Updating store ${stores[0].id}...`);
        await storeModule.updateStores(stores[0].id, {
            supported_currencies: [{ currency_code: 'vnd', is_default: true }]
        });
    }
    // 2. Update Region
    const { data: regions } = await query.graph({
        entity: 'region',
        fields: ['id']
    });
    if (regions[0]) {
        logger.info(`Updating region ${regions[0].id}...`);
        await regionModule.updateRegions(regions[0].id, {
            name: 'Vietnam',
            currency_code: 'vnd',
            countries: ['vn']
        });
    }
    logger.info(`Done updating store and region.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtdm5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2V0dXAtdm5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsMkJBc0NDO0FBekNELHFEQUE4RTtBQUcvRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQzVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVsRSxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN0RCxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN4RCxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUV4RCxrQkFBa0I7SUFDbEIsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDekMsTUFBTSxFQUFFLE9BQU87UUFDZixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUM7S0FDZixDQUFDLENBQUE7SUFFRixJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDaEQsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDM0Msb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ25FLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxtQkFBbUI7SUFDbkIsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDO0tBQ2YsQ0FBQyxDQUFBO0lBRUYsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2xELE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzlDLElBQUksRUFBRSxTQUFTO1lBQ2YsYUFBYSxFQUFFLEtBQUs7WUFDcEIsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7QUFDaEQsQ0FBQyJ9