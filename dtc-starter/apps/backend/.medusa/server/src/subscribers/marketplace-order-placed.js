"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = marketplaceOrderPlaced;
const utils_1 = require("@medusajs/framework/utils");
const emails_1 = require("../lib/marketplace/emails");
const orders_1 = require("../lib/marketplace/orders");
const transitions_1 = require("../lib/marketplace/transitions");
const marketplace_1 = require("../modules/marketplace");
/** Splits every new order into sub-orders per artisan and sends the emails. */
async function marketplaceOrderPlaced({ event: { data }, container, }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    try {
        const { marketplaceOrder, created } = await (0, orders_1.ensureMarketplaceOrder)(container, data.id);
        if (!created) {
            return;
        }
        await (0, emails_1.emailOrderPlaced)(container, marketplaceOrder.id);
        // COD sub-orders reach the artisans right away; bank transfers wait.
        const started = await marketplace.listSubOrders({
            marketplace_order_id: marketplaceOrder.id,
            status: ["pending_acceptance", "processing"],
        });
        for (const subOrder of started) {
            await (0, emails_1.emailArtisanNewSubOrder)(container, await (0, transitions_1.getFullSubOrder)(container, subOrder.id));
        }
    }
    catch (error) {
        logger.error(`Could not create marketplace sub-orders for order ${data.id}: ${error.message}`);
    }
}
exports.config = {
    event: "order.placed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2Utb3JkZXItcGxhY2VkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL21hcmtldHBsYWNlLW9yZGVyLXBsYWNlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFTQSx5Q0FxQ0M7QUE3Q0QscURBQXFFO0FBQ3JFLHNEQUFxRjtBQUNyRixzREFBa0U7QUFDbEUsZ0VBQWdFO0FBQ2hFLHdEQUEyRDtBQUczRCwrRUFBK0U7QUFDaEUsS0FBSyxVQUFVLHNCQUFzQixDQUFDLEVBQ25ELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLFdBQVcsR0FDZixTQUFTLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7SUFFdkMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sSUFBQSwrQkFBc0IsRUFDaEUsU0FBUyxFQUNULElBQUksQ0FBQyxFQUFFLENBQ1IsQ0FBQTtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxJQUFBLHlCQUFnQixFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUV0RCxxRUFBcUU7UUFDckUsTUFBTSxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDO1lBQzlDLG9CQUFvQixFQUFFLGdCQUFnQixDQUFDLEVBQUU7WUFDekMsTUFBTSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDO1NBQzdDLENBQUMsQ0FBQTtRQUVGLEtBQUssTUFBTSxRQUFRLElBQUksT0FBTyxFQUFFLENBQUM7WUFDL0IsTUFBTSxJQUFBLGdDQUF1QixFQUMzQixTQUFTLEVBQ1QsTUFBTSxJQUFBLDZCQUFlLEVBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FDOUMsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxLQUFLLENBQ1YscURBQXFELElBQUksQ0FBQyxFQUFFLEtBQU0sS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUM1RixDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFWSxRQUFBLE1BQU0sR0FBcUI7SUFDdEMsS0FBSyxFQUFFLGNBQWM7Q0FDdEIsQ0FBQSJ9