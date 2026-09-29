"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = marketplaceWeeklyPayouts;
const utils_1 = require("@medusajs/framework/utils");
const notify_1 = require("../lib/marketplace/notify");
const payouts_1 = require("../lib/marketplace/payouts");
/**
 * Monday 07:00 in Vietnam (00:00 UTC): drafts last week's payouts so the admin
 * only has to transfer the money and mark each one paid.
 */
async function marketplaceWeeklyPayouts(container) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const payouts = await (0, payouts_1.generatePayouts)(container);
    logger.info(`[marketplace] weekly payouts drafted: ${payouts.length}`);
    if (payouts.length) {
        await (0, notify_1.notifyAdmin)(container, `Có ${payouts.length} khoản cần chuyển cho nghệ nhân tuần này`, (0, notify_1.paragraph)("Vào Admin → Đối soát để chuyển tiền và đánh dấu đã chuyển."));
    }
}
exports.config = {
    name: "marketplace-weekly-payouts",
    schedule: "0 0 * * 1",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2Utd2Vla2x5LXBheW91dHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvam9icy9tYXJrZXRwbGFjZS13ZWVrbHktcGF5b3V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFTQSwyQ0FhQztBQXJCRCxxREFBcUU7QUFDckUsc0RBQWtFO0FBQ2xFLHdEQUE0RDtBQUU1RDs7O0dBR0c7QUFDWSxLQUFLLFVBQVUsd0JBQXdCLENBQUMsU0FBMEI7SUFDL0UsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEseUJBQWUsRUFBQyxTQUFTLENBQUMsQ0FBQTtJQUVoRCxNQUFNLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUV0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNuQixNQUFNLElBQUEsb0JBQVcsRUFDZixTQUFTLEVBQ1QsTUFBTSxPQUFPLENBQUMsTUFBTSwwQ0FBMEMsRUFDOUQsSUFBQSxrQkFBUyxFQUFDLDREQUE0RCxDQUFDLENBQ3hFLENBQUE7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLElBQUksRUFBRSw0QkFBNEI7SUFDbEMsUUFBUSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQSJ9