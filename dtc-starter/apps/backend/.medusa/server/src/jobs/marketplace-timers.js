"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = marketplaceTimers;
const utils_1 = require("@medusajs/framework/utils");
const transitions_1 = require("../lib/marketplace/transitions");
/**
 * Every minute: cancels bank transfers not paid within 10 minutes and
 * sub-orders not accepted within 12 hours, and completes sub-orders 2 days
 * after delivery.
 */
async function marketplaceTimers(container) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    for (const [name, run] of [
        ["expire unpaid transfers", transitions_1.expireUnpaidOrders],
        ["cancel unaccepted sub-orders", transitions_1.cancelOverdueAcceptances],
        ["complete delivered sub-orders", transitions_1.completeDeliveredSubOrders],
    ]) {
        try {
            const count = await run(container);
            if (count) {
                logger.info(`[marketplace] ${name}: ${count}`);
            }
        }
        catch (error) {
            logger.error(`[marketplace] ${name} failed: ${error.message}`);
        }
    }
}
exports.config = {
    name: "marketplace-timers",
    schedule: "* * * * *",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2UtdGltZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2pvYnMvbWFya2V0cGxhY2UtdGltZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWFBLG9DQWtCQztBQTlCRCxxREFBcUU7QUFDckUsZ0VBSXVDO0FBRXZDOzs7O0dBSUc7QUFDWSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsU0FBMEI7SUFDeEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVsRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDeEIsQ0FBQyx5QkFBeUIsRUFBRSxnQ0FBa0IsQ0FBQztRQUMvQyxDQUFDLDhCQUE4QixFQUFFLHNDQUF3QixDQUFDO1FBQzFELENBQUMsK0JBQStCLEVBQUUsd0NBQTBCLENBQUM7S0FDckQsRUFBRSxDQUFDO1FBQ1gsSUFBSSxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFbEMsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDVixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQTtZQUNoRCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixJQUFJLFlBQWEsS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDM0UsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQUc7SUFDcEIsSUFBSSxFQUFFLG9CQUFvQjtJQUMxQixRQUFRLEVBQUUsV0FBVztDQUN0QixDQUFBIn0=