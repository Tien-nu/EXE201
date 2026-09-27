import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/** Gives the stock held for these line items back, e.g. on cancellation. */
export async function releaseReservations(
  container: MedusaContainer,
  lineItemIds: string[]
) {
  if (!lineItemIds.length) {
    return
  }

  const inventory = container.resolve(Modules.INVENTORY)
  await inventory.deleteReservationItemsByLineItem(lineItemIds)
}

/**
 * The parcel left the artisan: takes the held quantity out of stock for good
 * and drops the reservations. Made-to-order items have none, so skip.
 */
export async function consumeReservations(
  container: MedusaContainer,
  lineItemIds: string[]
) {
  if (!lineItemIds.length) {
    return
  }

  const inventory = container.resolve(Modules.INVENTORY)
  const reservations = await inventory.listReservationItems({
    line_item_id: lineItemIds,
  })

  for (const reservation of reservations) {
    await inventory.adjustInventory(
      reservation.inventory_item_id,
      reservation.location_id,
      -Number(reservation.quantity)
    )
  }

  await inventory.deleteReservationItemsByLineItem(lineItemIds)
}
