"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = clearMedusaProducts;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function clearMedusaProducts({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    logger.info('Deleting old Medusa demo products...');
    const { data: allProducts } = await query.graph({
        entity: 'product',
        fields: ['id', 'title'],
    });
    if (allProducts.length > 0) {
        const ids = allProducts.map(p => p.id);
        await (0, core_flows_1.deleteProductsWorkflow)(container).run({
            input: { ids }
        });
        logger.info(`Deleted ${ids.length} products!`);
    }
    else {
        logger.info('No products found to delete.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLW1lZHVzYS1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2RlbGV0ZS1tZWR1c2EtcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxzQ0FvQkM7QUF4QkQscURBQXFFO0FBRXJFLDREQUFvRTtBQUVyRCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDdkUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWhFLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQTtJQUVuRCxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUM5QyxNQUFNLEVBQUUsU0FBUztRQUNqQixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO0tBQ3hCLENBQUMsQ0FBQTtJQUVGLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMzQixNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQVksQ0FBQyxDQUFBO1FBQ2hELE1BQU0sSUFBQSxtQ0FBc0IsRUFBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDMUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFO1NBQ2YsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxNQUFNLFlBQVksQ0FBQyxDQUFBO0lBQ2hELENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0lBQzdDLENBQUM7QUFDSCxDQUFDIn0=