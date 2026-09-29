"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkPrice;
const utils_1 = require("@medusajs/framework/utils");
async function checkPrice({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const variantId = "variant_01M3BAPC8PF8Q0MPPAVXM2N4DK";
    const { data: variants } = await query.graph({
        entity: 'variant',
        fields: ['id', 'title', 'prices.*'],
        filters: {
            id: variantId
        }
    });
    console.log("Variant details:", JSON.stringify(variants, null, 2));
    const { data: regions } = await query.graph({
        entity: 'region',
        fields: ['id', 'name', 'currency_code']
    });
    console.log("Regions in DB:", JSON.stringify(regions, null, 2));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stcHJpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jaGVjay1wcmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLDZCQW9CQztBQXZCRCxxREFBcUU7QUFHdEQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUM5RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sU0FBUyxHQUFHLG9DQUFvQyxDQUFBO0lBRXRELE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzNDLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDO1FBQ25DLE9BQU8sRUFBRTtZQUNQLEVBQUUsRUFBRSxTQUFTO1NBQ2Q7S0FDRixDQUFDLENBQUE7SUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRWxFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDO0tBQ3hDLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakUsQ0FBQyJ9