import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { AUTO_COMPLETE_DAYS, DAY } from "./constants"
import {
  emailArtisanNewSubOrder,
  emailCompleted,
  emailDelivered,
  emailPaymentConfirmed,
  emailReadyToShip,
  emailRefunded,
  emailShipping,
  emailSubOrderAccepted,
  emailSubOrderCanceled,
  emailTransferSubmitted,
  type FullSubOrder,
} from "./emails"
import { addMs } from "./format"
import { consumeReservations, releaseReservations } from "./inventory"
import { startState } from "./orders"

type CanceledBy = "customer" | "artisan" | "system" | "admin"

const SUB_ORDER_RELATIONS = ["items", "artisan", "marketplace_order"]

const service = (container: MedusaContainer): MarketplaceModuleService =>
  container.resolve(MARKETPLACE_MODULE)

export async function getFullSubOrder(
  container: MedusaContainer,
  id: string
): Promise<FullSubOrder> {
  return (await service(container).retrieveSubOrder(id, {
    relations: SUB_ORDER_RELATIONS,
  })) as unknown as FullSubOrder
}

const notAllowed = (message: string) =>
  new MedusaError(MedusaError.Types.NOT_ALLOWED, message)

function assertStatus(
  subOrder: { status: string; code: string },
  allowed: string[],
  message: string
) {
  if (!allowed.includes(subOrder.status)) {
    throw notAllowed(`Đơn ${subOrder.code}: ${message}`)
  }
}

function assertOwner(subOrder: FullSubOrder, artisanId: string) {
  if (subOrder.artisan.id !== artisanId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng")
  }
}

// ---- Payment -------------------------------------------------------------

/** Moves every sub-order still waiting on payment to its next state. */
async function startPaidSubOrders(container: MedusaContainer, marketplaceOrderId: string) {
  const marketplace = service(container)
  const now = new Date()
  const waiting = await marketplace.listSubOrders({
    marketplace_order_id: marketplaceOrderId,
    status: "pending_payment",
  })

  for (const subOrder of waiting) {
    await marketplace.updateSubOrders({ id: subOrder.id, ...startState(subOrder, now) })
    await emailArtisanNewSubOrder(container, await getFullSubOrder(container, subOrder.id))
  }
}

/** The customer says they made the transfer; an admin still has to check. */
export async function submitTransfer(
  container: MedusaContainer,
  marketplaceOrderId: string
) {
  const marketplace = service(container)
  const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId)

  if (order.payment_status !== "awaiting_transfer") {
    throw notAllowed("Đơn này không còn chờ chuyển khoản")
  }

  if (order.payment_deadline && new Date(order.payment_deadline) < new Date()) {
    throw notAllowed("Đã quá 10 phút, đơn hàng đã bị huỷ")
  }

  const updated = await marketplace.updateMarketplaceOrders({
    id: order.id,
    payment_status: "transfer_submitted",
    transfer_submitted_at: new Date(),
  })

  await emailTransferSubmitted(container, order)

  return updated
}

export async function confirmPayment(
  container: MedusaContainer,
  marketplaceOrderId: string
) {
  const marketplace = service(container)
  const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId)

  if (!["awaiting_transfer", "transfer_submitted"].includes(order.payment_status)) {
    throw notAllowed("Đơn này không chờ xác nhận chuyển khoản")
  }

  await marketplace.updateMarketplaceOrders({
    id: order.id,
    payment_status: "paid",
    paid_at: new Date(),
  })

  await emailPaymentConfirmed(container, order)
  await startPaidSubOrders(container, order.id)
}

/** The money never arrived: cancel what was still waiting on it. */
export async function rejectPayment(
  container: MedusaContainer,
  marketplaceOrderId: string,
  reason?: string
) {
  const marketplace = service(container)
  const order = await marketplace.retrieveMarketplaceOrder(marketplaceOrderId)

  if (!["awaiting_transfer", "transfer_submitted"].includes(order.payment_status)) {
    throw notAllowed("Đơn này không chờ xác nhận chuyển khoản")
  }

  await marketplace.updateMarketplaceOrders({ id: order.id, payment_status: "rejected" })
  await cancelWaitingOnPayment(
    container,
    order.id,
    "admin",
    reason || "Yarnly không nhận được tiền chuyển khoản"
  )
}

async function cancelWaitingOnPayment(
  container: MedusaContainer,
  marketplaceOrderId: string,
  by: CanceledBy,
  reason: string
) {
  const waiting = await service(container).listSubOrders({
    marketplace_order_id: marketplaceOrderId,
    status: "pending_payment",
  })

  for (const subOrder of waiting) {
    await cancelSubOrder(container, subOrder.id, by, reason)
  }
}

/** Job: bank transfers not confirmed by the customer within 10 minutes. */
export async function expireUnpaidOrders(container: MedusaContainer) {
  const marketplace = service(container)
  const overdue = await marketplace.listMarketplaceOrders({
    payment_status: "awaiting_transfer",
    payment_deadline: { $lt: new Date() },
  })

  for (const order of overdue) {
    await marketplace.updateMarketplaceOrders({ id: order.id, payment_status: "expired" })
    await cancelWaitingOnPayment(
      container,
      order.id,
      "system",
      "Quá 10 phút chưa thanh toán chuyển khoản"
    )
  }

  return overdue.length
}

// ---- Cancellation --------------------------------------------------------

/**
 * Cancels one sub-order: gives its stock back, flags a refund when the
 * customer already paid by transfer, and cancels the Medusa order once
 * nothing of it is left.
 */
export async function cancelSubOrder(
  container: MedusaContainer,
  subOrderId: string,
  by: CanceledBy,
  reason: string
) {
  const marketplace = service(container)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const subOrder = await getFullSubOrder(container, subOrderId)

  assertStatus(subOrder, [
    "pending_payment",
    "pending_acceptance",
    "processing",
    "ready_to_ship",
    "shipping",
    "delivered",
  ], "không thể huỷ ở trạng thái hiện tại")

  const order = subOrder.marketplace_order
  const paid =
    order.payment_method === "bank_transfer" &&
    ["paid", "transfer_submitted"].includes(order.payment_status)
  const artisanSawIt = subOrder.status !== "pending_payment"

  await marketplace.updateSubOrders({
    id: subOrder.id,
    status: "canceled",
    canceled_at: new Date(),
    canceled_by: by,
    cancel_reason: reason,
    refund_status: paid ? "pending" : "not_required",
  })

  await releaseReservations(
    container,
    subOrder.items.map((item: any) => item.line_item_id)
  )

  const siblings = await marketplace.listSubOrders({ marketplace_order_id: order.id })

  if (siblings.every((sibling) => sibling.status === "canceled")) {
    try {
      await cancelOrderWorkflow(container).run({
        input: { order_id: order.order_id },
      })
    } catch (error) {
      logger.warn(
        `Could not cancel Medusa order ${order.order_id}: ${(error as Error).message}`
      )
    }
  }

  await emailSubOrderCanceled(
    container,
    await getFullSubOrder(container, subOrder.id),
    artisanSawIt && by !== "artisan"
  )
}

export async function customerCancelSubOrder(
  container: MedusaContainer,
  subOrderId: string,
  customerId: string
) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  const order = await service(container).retrieveMarketplaceOrder(
    subOrder.marketplace_order.id
  )

  if (order.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng")
  }

  assertStatus(
    subOrder,
    ["pending_payment", "pending_acceptance"],
    "nghệ nhân đã nhận đơn nên không thể tự huỷ"
  )

  await cancelSubOrder(container, subOrderId, "customer", "Khách hàng huỷ đơn")
}

/** Job: sub-orders the artisan did not accept within 12 hours. */
export async function cancelOverdueAcceptances(container: MedusaContainer) {
  const overdue = await service(container).listSubOrders({
    status: "pending_acceptance",
    accept_deadline: { $lt: new Date() },
  })

  for (const subOrder of overdue) {
    await cancelSubOrder(
      container,
      subOrder.id,
      "system",
      "Nghệ nhân không xác nhận đơn trong 12 tiếng"
    )
  }

  return overdue.length
}

// ---- Artisan -------------------------------------------------------------

export async function acceptSubOrder(
  container: MedusaContainer,
  subOrderId: string,
  artisanId: string
) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  assertOwner(subOrder, artisanId)
  assertStatus(subOrder, ["pending_acceptance"], "không ở trạng thái chờ xác nhận")

  if (subOrder.accept_deadline && new Date(subOrder.accept_deadline) < new Date()) {
    throw notAllowed(`Đơn ${subOrder.code} đã quá hạn 12 tiếng`)
  }

  const now = new Date()

  await service(container).updateSubOrders({
    id: subOrder.id,
    status: "processing",
    accepted_at: now,
    due_date: subOrder.lead_days ? addMs(now, subOrder.lead_days * DAY) : null,
  })

  await emailSubOrderAccepted(container, await getFullSubOrder(container, subOrder.id))
}

export async function declineSubOrder(
  container: MedusaContainer,
  subOrderId: string,
  artisanId: string,
  reason: string
) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  assertOwner(subOrder, artisanId)
  assertStatus(subOrder, ["pending_acceptance"], "không ở trạng thái chờ xác nhận")

  await cancelSubOrder(container, subOrderId, "artisan", `Nghệ nhân từ chối: ${reason}`)
}

export async function markReadyToShip(
  container: MedusaContainer,
  subOrderId: string,
  artisanId: string
) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  assertOwner(subOrder, artisanId)
  assertStatus(subOrder, ["processing"], "chưa được nhận hoặc đã làm xong")

  await service(container).updateSubOrders({
    id: subOrder.id,
    status: "ready_to_ship",
    ready_at: new Date(),
  })

  await emailReadyToShip(container, await getFullSubOrder(container, subOrder.id))
}

// ---- Admin: shipping -----------------------------------------------------

export async function shipSubOrder(
  container: MedusaContainer,
  subOrderId: string,
  shipment: { carrier: string; tracking_number: string }
) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  assertStatus(subOrder, ["ready_to_ship"], "nghệ nhân chưa báo làm xong")

  await service(container).updateSubOrders({
    id: subOrder.id,
    status: "shipping",
    carrier: shipment.carrier,
    tracking_number: shipment.tracking_number,
    shipped_at: new Date(),
  })

  // Ready-made stock leaves the shelf; made-to-order items were never stocked.
  const [madeToOrder, ready] = [true, false].map((flag) =>
    subOrder.items
      .filter((item: any) => !!item.made_to_order === flag)
      .map((item: any) => item.line_item_id as string)
  )

  await consumeReservations(container, ready)
  await releaseReservations(container, madeToOrder)

  await emailShipping(container, await getFullSubOrder(container, subOrder.id))
}

export async function markDelivered(container: MedusaContainer, subOrderId: string) {
  const subOrder = await getFullSubOrder(container, subOrderId)
  assertStatus(subOrder, ["shipping"], "chưa được giao cho đơn vị vận chuyển")

  const now = new Date()

  await service(container).updateSubOrders({
    id: subOrder.id,
    status: "delivered",
    delivered_at: now,
    complete_at: addMs(now, AUTO_COMPLETE_DAYS * DAY),
  })

  await emailDelivered(container, await getFullSubOrder(container, subOrder.id))
}

/** Job: delivered sub-orders whose 2 days have passed. */
export async function completeDeliveredSubOrders(container: MedusaContainer) {
  const marketplace = service(container)
  const due = await marketplace.listSubOrders({
    status: "delivered",
    complete_at: { $lt: new Date() },
  })

  for (const subOrder of due) {
    await marketplace.updateSubOrders({
      id: subOrder.id,
      status: "completed",
      completed_at: new Date(),
    })
    await emailCompleted(container, await getFullSubOrder(container, subOrder.id))
  }

  return due.length
}

export async function markRefunded(container: MedusaContainer, subOrderId: string) {
  const subOrder = await getFullSubOrder(container, subOrderId)

  if (subOrder.refund_status !== "pending") {
    throw notAllowed(`Đơn ${subOrder.code} không có khoản cần hoàn`)
  }

  await service(container).updateSubOrders({
    id: subOrder.id,
    refund_status: "refunded",
    refunded_at: new Date(),
  })

  await emailRefunded(container, subOrder)
}
