import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CreateFulfillmentResult,
  FulfillmentOption,
} from "@medusajs/framework/types"

/**
 * The "Giao Hàng Nhanh (GHN)" shipping option customers pick at checkout.
 *
 * It is a flat 0₫ option on purpose: the customer pays GHN's fee to the
 * shipper on delivery. The real GHN orders are booked per artisan from
 * Admin → Đơn sàn (see src/lib/marketplace/ghn-shipping.ts), because each
 * artisan's parcel is picked up at a different address. Medusa's own
 * "Create Fulfillment" is blocked for marketplace orders.
 */
class GHNFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "ghn-fulfillment"

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [{ id: "ghn-standard", name: "GHN Tiêu chuẩn" }]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return { ...optionData, ...data }
  }

  async validateOption(): Promise<boolean> {
    return true
  }

  async canCalculate(): Promise<boolean> {
    return false
  }

  async calculatePrice(): Promise<CalculatedShippingOptionPrice> {
    return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
  }

  // Only reached for orders placed before the marketplace existed.
  async createFulfillment(): Promise<CreateFulfillmentResult> {
    return { data: {}, labels: [] }
  }

  async cancelFulfillment(): Promise<Record<string, unknown>> {
    return {}
  }

  async createReturnFulfillment(): Promise<CreateFulfillmentResult> {
    return { data: {}, labels: [] }
  }
}

export default GHNFulfillmentService
