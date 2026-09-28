import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
// import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const payload = req.body as any
    console.log("=> Nhận được Webhook từ GHN:", payload)

    const orderCode = payload.OrderCode
    const status = payload.Status

    if (!orderCode || !status) {
      return res.status(200).json({ success: true, message: "Bỏ qua do payload không có OrderCode/Status" })
    }

    // Lấy Query Service của Medusa
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // Tìm danh sách Fulfillment trong DB để đối chiếu tracking_number
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "data", "status", "order_id"],
    })

    // Tìm Fulfillment khớp với mã vận đơn GHN
    const fulfillment = fulfillments.find(f => f.data?.tracking_number === orderCode)

    if (fulfillment) {
      console.log(`Tìm thấy Fulfillment ${fulfillment.id} cho đơn vận: ${orderCode}. Đang cập nhật trạng thái...`)
      
      const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
      
      // Xử lý mapping trạng thái GHN sang Medusa
      // Các trạng thái của GHN: ready_to_pick, picking, delivering, delivered, return, returned...
      
      const updateData: any = { id: fulfillment.id }
      
      if (status === "delivering" || status === "shipping") {
        updateData.shipped_at = new Date()
      } else if (status === "delivered") {
        updateData.delivered_at = new Date()
      } else if (status === "returned" || status === "cancel") {
        updateData.canceled_at = new Date()
      }

      // Cập nhật thông tin fulfillment
      await (fulfillmentModule as any).updateFulfillment(fulfillment.id, updateData)
      
      // Đồng thời cập nhật trạng thái của Order để Frontend và Seller nhìn thấy
      const orderId = (fulfillment as any).order_id
      if (orderId) {
        try {
          const orderModule = req.scope.resolve(Modules.ORDER)
          const orderUpdateData: any = { id: orderId }
          if (status === "delivering" || status === "shipping") {
            orderUpdateData.status = "pending" // Or any valid status
          }
          
          // Note: fulfillment_status does not exist on Order in v2, 
          // we are only interested in updating SubOrders anyway.
          
          // Cập nhật SubOrder trong hệ thống Marketplace
          try {
            const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
            const { data: mpos } = await query.graph({
              entity: "marketplace_order",
              fields: ["id", "sub_orders.*"],
              filters: { order_id: orderId }
            })
            const subOrders = mpos?.[0]?.sub_orders || []
            
            // Note: Since GHN Fulfillment maps to the whole order in this basic setup,
            // we will update all related sub_orders to keep the Marketplace UI in sync.
            // Ideally we'd match by tracking_number, but it may not be saved on sub_order yet.
            const marketplaceModule = req.scope.resolve("marketplace") as any
            if (marketplaceModule && subOrders.length > 0) {
              const now = new Date()
              for (const sub of subOrders) {
                if (!sub) continue
                const subUpdate: any = { id: sub.id }
                if (status === "delivering" || status === "shipping") {
                  subUpdate.status = "shipping"
                  subUpdate.shipped_at = now
                } else if (status === "delivered") {
                  subUpdate.status = "delivered"
                  subUpdate.delivered_at = now
                  subUpdate.complete_at = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
                } else if (status === "returned" || status === "cancel") {
                  subUpdate.status = "canceled"
                  subUpdate.canceled_at = now
                  subUpdate.canceled_by = "system"
                  subUpdate.cancel_reason = "GHN báo hủy hoặc hoàn hàng"
                }
                
                await marketplaceModule.updateSubOrders([subUpdate])
                console.log(`=> Đã cập nhật SubOrder ${sub.id} thành ${subUpdate.status}`)
              }
            }
          } catch (err) {
            console.error("Lỗi khi update SubOrder:", err)
          }

        } catch (e) {
          console.error("Không thể update trạng thái Order:", e)
        }
      }

      console.log(`=> Đã cập nhật thành công trạng thái '${status}' cho Fulfillment ${fulfillment.id}`)
    } else {
      console.log(`Không tìm thấy Fulfillment nào trong hệ thống khớp với mã: ${orderCode}`)
    }

    // Trả về 200 để GHN không gọi lại (retry)
    res.status(200).json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("Lỗi khi xử lý Webhook GHN:", error)
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}
