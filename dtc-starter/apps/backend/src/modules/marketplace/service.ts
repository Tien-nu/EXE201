import type { Context } from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"
import Artisan from "./models/artisan"
import CustomRequest from "./models/custom-request"
import MarketplaceOrder from "./models/marketplace-order"
import MarketplaceSetting from "./models/marketplace-setting"
import Payout from "./models/payout"
import SubOrder from "./models/sub-order"
import SubOrderItem from "./models/sub-order-item"

type NewSubOrder = Record<string, unknown> & {
  items: Record<string, unknown>[]
}

class MarketplaceModuleService extends MedusaService({
  Artisan,
  MarketplaceOrder,
  SubOrder,
  SubOrderItem,
  CustomRequest,
  Payout,
  MarketplaceSetting,
}) {
  /** The single settings row, created with defaults on first read. */
  async getSettings() {
    const [settings] = await this.listMarketplaceSettings({}, { take: 1 })

    if (settings) {
      return settings
    }

    return await this.createMarketplaceSettings({
      platform_fee_percent: 0,
      admin_email: process.env.ADMIN_NOTIFY_EMAIL || null,
      bank_name: "MB Bank",
      bank_code: "mb",
      bank_account_number: "0912037670",
      bank_account_name: "YARNLY STORE",
    })
  }

  /**
   * Creates the marketplace order with its sub-orders and their items in one
   * transaction, so an order never exists with only part of its sub-orders.
   */
  @InjectManager()
  async createOrderWithSubOrders(
    data: { order: Record<string, unknown>; sub_orders: NewSubOrder[] },
    @MedusaContext() sharedContext: Context = {}
  ) {
    return await this.createOrderWithSubOrders_(data, sharedContext)
  }

  @InjectTransactionManager()
  protected async createOrderWithSubOrders_(
    data: { order: Record<string, unknown>; sub_orders: NewSubOrder[] },
    @MedusaContext() sharedContext: Context = {}
  ) {
    const order = await this.createMarketplaceOrders(
      data.order as any,
      sharedContext
    )

    for (const { items, ...subOrder } of data.sub_orders) {
      const created = await this.createSubOrders(
        { ...subOrder, marketplace_order_id: order.id } as any,
        sharedContext
      )

      await this.createSubOrderItems(
        items.map((item) => ({ ...item, sub_order_id: created.id })) as any,
        sharedContext
      )
    }

    return order
  }
}

export default MarketplaceModuleService
