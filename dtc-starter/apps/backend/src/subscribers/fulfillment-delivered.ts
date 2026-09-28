// @ts-nocheck
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function fulfillmentDelivered({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // Cố gắng lấy fulfillment_id từ payload (vì delivery.created thường có data.fulfillment_id)
    let fulfillmentId = data.id
    if ((data as any).fulfillment_id) {
      fulfillmentId = (data as any).fulfillment_id
    }

    // Tìm fulfillment dựa trên fulfillmentId
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "order_id"],
      filters: { id: fulfillmentId }
    })
    
    let order_id = fulfillments?.[0]?.order_id
    
    // Nếu vẫn không thấy, thử tìm nếu payload có order_id
    if (!order_id) {
       order_id = (data as any).order_id
    }

    // Cuối cùng, tìm tất cả fulfillment xem có cái nào liên kết với delivery này không (fallback)
    if (!order_id) {
      const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
      // Không gọi API phức tạp, dựa vào dữ liệu đã có
    }

    if (order_id) {
      // Determine target status based on event name
      let targetStatus = null
      const eventName = event.name
      
      if (eventName === 'delivery.created') {
        targetStatus = 'delivered'
      } else if (eventName === 'shipment.created') {
        targetStatus = 'shipping'
      }

      const { data: mpos } = await query.graph({
        entity: "marketplace_order",
        fields: ["id", "sub_orders.*"],
        filters: { order_id: order_id }
      })
      const subOrders = mpos?.[0]?.sub_orders || []

      const marketplaceModule = container.resolve("marketplace") as any
      if (marketplaceModule && subOrders.length > 0 && targetStatus) {
        const now = new Date()
        for (const sub of subOrders) {
          if (targetStatus === "delivered" && sub.status !== "delivered" && sub.status !== "completed") {
            await marketplaceModule.updateSubOrders([{
              id: sub.id,
              status: "delivered",
              delivered_at: now,
              complete_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
            }])
            logger.info(`[Subscriber] Cập nhật SubOrder ${sub.id} thành delivered`)
          } else if (targetStatus === "shipping" && sub.status !== "shipping" && sub.status !== "delivered" && sub.status !== "completed") {
            await marketplaceModule.updateSubOrders([{
              id: sub.id,
              status: "shipping",
              shipped_at: now
            }])
            logger.info(`[Subscriber] Cập nhật SubOrder ${sub.id} thành shipping`)
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Lỗi khi sync SubOrder từ sự kiện delivered: ${(error as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "delivery.created",
    "order.fulfillment_updated",
    "fulfillment.updated",
    "shipment.created",
    "fulfillment.created"
  ]
}
