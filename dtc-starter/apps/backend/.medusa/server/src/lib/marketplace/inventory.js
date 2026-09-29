"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseReservations = releaseReservations;
exports.consumeReservations = consumeReservations;
const utils_1 = require("@medusajs/framework/utils");
/** Gives the stock held for these line items back, e.g. on cancellation. */
async function releaseReservations(container, lineItemIds) {
    if (!lineItemIds.length) {
        return;
    }
    const inventory = container.resolve(utils_1.Modules.INVENTORY);
    await inventory.deleteReservationItemsByLineItem(lineItemIds);
}
/**
 * The parcel left the artisan: takes the held quantity out of stock for good
 * and drops the reservations. Made-to-order items have none, so skip.
 */
async function consumeReservations(container, lineItemIds) {
    if (!lineItemIds.length) {
        return;
    }
    const inventory = container.resolve(utils_1.Modules.INVENTORY);
    const reservations = await inventory.listReservationItems({
        line_item_id: lineItemIds,
    });
    for (const reservation of reservations) {
        await inventory.adjustInventory(reservation.inventory_item_id, reservation.location_id, -Number(reservation.quantity));
    }
    await inventory.deleteReservationItemsByLineItem(lineItemIds);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9pbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrREFVQztBQU1ELGtEQXNCQztBQXpDRCxxREFBbUQ7QUFFbkQsNEVBQTRFO0FBQ3JFLEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsU0FBMEIsRUFDMUIsV0FBcUI7SUFFckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RELE1BQU0sU0FBUyxDQUFDLGdDQUFnQyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQy9ELENBQUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLFNBQTBCLEVBQzFCLFdBQXFCO0lBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsT0FBTTtJQUNSLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN0RCxNQUFNLFlBQVksR0FBRyxNQUFNLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztRQUN4RCxZQUFZLEVBQUUsV0FBVztLQUMxQixDQUFDLENBQUE7SUFFRixLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sU0FBUyxDQUFDLGVBQWUsQ0FDN0IsV0FBVyxDQUFDLGlCQUFpQixFQUM3QixXQUFXLENBQUMsV0FBVyxFQUN2QixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQzlCLENBQUE7SUFDSCxDQUFDO0lBRUQsTUFBTSxTQUFTLENBQUMsZ0NBQWdDLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDL0QsQ0FBQyJ9