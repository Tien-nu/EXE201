import { model } from "@medusajs/framework/utils"
import SubOrder from "./sub-order"

/** Snapshot of an order line item, so sub-orders read without the order. */
const SubOrderItem = model.define("sub_order_item", {
  id: model.id({ prefix: "suboi" }).primaryKey(),
  line_item_id: model.text(),
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  title: model.text(),
  variant_title: model.text().nullable(),
  thumbnail: model.text().nullable(),
  // Made-to-order items are not taken out of stock when shipped.
  made_to_order: model.boolean().default(false),
  quantity: model.number(),
  unit_price: model.bigNumber(),
  total: model.bigNumber(),
  sub_order: model.belongsTo(() => SubOrder, { mappedBy: "items" }),
})

export default SubOrderItem
