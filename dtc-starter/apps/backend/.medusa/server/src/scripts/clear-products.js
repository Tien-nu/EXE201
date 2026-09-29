"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = clearProducts;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function clearProducts({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    logger.info('Bắt đầu xoá toàn bộ sản phẩm cũ...');
    const { data: allProducts } = await query.graph({
        entity: 'product',
        fields: ['id'],
    });
    if (allProducts.length > 0) {
        const ids = allProducts.map(p => p.id);
        await (0, core_flows_1.deleteProductsWorkflow)(container).run({
            input: { ids }
        });
        logger.info(`Đã xoá thành công ${ids.length} sản phẩm cũ!`);
    }
    else {
        logger.info('Không có sản phẩm nào để xoá.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXItcHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jbGVhci1wcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGdDQW9CQztBQXhCRCxxREFBOEU7QUFFOUUsNERBQW9FO0FBRXJELEtBQUssVUFBVSxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDakUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWhFLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtJQUVqRCxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUM5QyxNQUFNLEVBQUUsU0FBUztRQUNqQixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUM7S0FDZixDQUFDLENBQUE7SUFFRixJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDM0IsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFZLENBQUMsQ0FBQTtRQUNoRCxNQUFNLElBQUEsbUNBQXNCLEVBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQzFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRTtTQUNmLENBQUMsQ0FBQTtRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxNQUFNLGVBQWUsQ0FBQyxDQUFBO0lBQzdELENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0lBQzlDLENBQUM7QUFDSCxDQUFDIn0=