// @ts-nocheck
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"

export class GHNFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "ghn-fulfillment"

  // TODO: Bạn cần cấu hình các thông số này trong .env
  private GHN_API_URL = process.env.GHN_API_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api/v2"
  private GHN_API_TOKEN = process.env.GHN_API_TOKEN || "YOUR_GHN_TEST_TOKEN"
  private GHN_SHOP_ID = process.env.GHN_SHOP_ID || "YOUR_GHN_SHOP_ID"

  constructor(container: any) {
    super()
  }

  // 1. Trả về các tuỳ chọn giao hàng hiển thị trong Admin khi cấu hình Shipping Profile
  async getFulfillmentOptions(): Promise<any[]> {
    return [
      {
        id: "ghn-standard",
        name: "GHN Tiêu chuẩn",
      },
      {
        id: "ghn-express",
        name: "GHN Giao nhanh",
      },
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<any> {
    return { ...optionData, ...data }
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(data: Record<string, unknown>): Promise<boolean> {
    // Trả về true nếu bạn muốn tích hợp API tính phí ship GHN (Fee API)
    return true
  }

  // 2. Hàm gọi API tính giá ship của GHN (Tính phí trước khi đặt hàng)
  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<number> {
    try {
      const cart = data as any
      // Lấy province_id, district_id, ward_code từ metadata của giỏ hàng hoặc địa chỉ giao hàng
      const districtId = cart.shipping_address?.metadata?.district_id || cart.metadata?.district_id
      const wardCode = cart.shipping_address?.metadata?.ward_code || cart.metadata?.ward_code
      
      if (!districtId || !wardCode) {
        console.log("-> Thiếu district_id hoặc ward_code, trả về phí mặc định 30k")
        return 30000 
      }

      // Giả sử lấy cân nặng từ items
      const items = cart.items || []
      const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight || 200) * item.quantity, 0) || 200

      const payload = {
        service_type_id: 2,
        insurance_value: 0,
        coupon: null,
        to_ward_code: String(wardCode),
        to_district_id: Number(districtId),
        from_district_id: 1454, // TODO: Sửa thành quận thật của kho bạn
        weight: totalWeight,
        length: 10,
        width: 10,
        height: 10
      }

      const response = await fetch(`${this.GHN_API_URL}/shipping-order/fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Token": this.GHN_API_TOKEN,
          "ShopId": this.GHN_SHOP_ID,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      
      if (result.code === 200 && result.data?.total) {
        return result.data.total
      }
      
      return 30000 // Fallback
    } catch (e) {
      console.error("Lỗi tính phí ship GHN:", e)
      return 30000
    }
  }

  // 3. Hàm tạo đơn giao hàng sang GHN (Tự động chạy khi bạn bấm "Create Fulfillment" trong Admin)
  async createFulfillment(
    data: Record<string, unknown>,
    items: any[],
    order: any,
    fulfillment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.log("-> Đang gửi yêu cầu tạo đơn sang GHN...")

    const ghnItems = items.map((item: any) => ({
      name: item.title || "Sản phẩm",
      quantity: item.quantity,
      price: item.unit_price || 0,
      weight: item.weight || 200,
    }))

    const totalWeight = ghnItems.reduce((sum, item) => sum + item.weight * item.quantity, 0) || 200

    const districtId = order.shipping_address?.metadata?.district_id || order.metadata?.district_id || 1454
    const wardCode = order.shipping_address?.metadata?.ward_code || order.metadata?.ward_code || "20314"

    const ghnPayload = {
      payment_type_id: 2, 
      note: "Giao hàng cẩn thận",
      required_note: "CHOXEMHANGKHONGTHU", 
      to_name: order.shipping_address?.first_name + " " + (order.shipping_address?.last_name || ""),
      to_phone: order.shipping_address?.phone || "0999999999",
      to_address: order.shipping_address?.address_1 || "Địa chỉ mặc định",
      to_ward_code: String(wardCode),
      to_district_id: Number(districtId),
      weight: totalWeight,
      length: 10,
      width: 10,
      height: 10,
      service_type_id: 2, 
      items: ghnItems,
    }

    try {
      const response = await fetch(`${this.GHN_API_URL}/shipping-order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Token": this.GHN_API_TOKEN,
          "ShopId": this.GHN_SHOP_ID,
        },
        body: JSON.stringify(ghnPayload),
      })

      const result = await response.json()

      if (result.code === 200) {
        console.log("-> Bắn đơn GHN thành công! Tracking Code:", result.data.order_code)
        
        return {
          tracking_number: result.data.order_code,
          expected_delivery_time: result.data.expected_delivery_time,
          total_fee: result.data.total_fee,
          ...data,
        }
      } else {
        console.error("Lỗi từ GHN:", result.message)
        return { error: result.message, tracking_number: "GHN_ERROR_" + Date.now() }
      }
    } catch (error) {
      console.error("Lỗi kết nối GHN:", error)
      return { error: "Không thể kết nối đến GHN", tracking_number: "GHN_ERROR_" + Date.now() }
    }
  }

  // 4. Hủy đơn hàng bên GHN
  async cancelFulfillment(
    fulfillmentData: Record<string, unknown>
  ): Promise<any> {
    const order_code = fulfillmentData.tracking_number
    if (!order_code || (order_code as string).includes("ERROR")) return {}

    console.log(`-> Hủy đơn GHN: ${order_code}`)
    
    // API Hủy đơn
    // await fetch(`${this.GHN_API_URL}/switch-status/cancel`, { ... body: { order_codes: [order_code] } })
    return {}
  }

  async createReturnFulfillment(
    fulfillmentData: Record<string, unknown>
  ): Promise<any> {
    return {}
  }
}

export default GHNFulfillmentService
