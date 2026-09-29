"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const sub_order_1 = __importDefault(require("./sub-order"));
/** Snapshot of an order line item, so sub-orders read without the order. */
const SubOrderItem = utils_1.model.define("sub_order_item", {
    id: utils_1.model.id({ prefix: "suboi" }).primaryKey(),
    line_item_id: utils_1.model.text(),
    product_id: utils_1.model.text().nullable(),
    variant_id: utils_1.model.text().nullable(),
    title: utils_1.model.text(),
    variant_title: utils_1.model.text().nullable(),
    thumbnail: utils_1.model.text().nullable(),
    // Made-to-order items are not taken out of stock when shipped.
    made_to_order: utils_1.model.boolean().default(false),
    quantity: utils_1.model.number(),
    unit_price: utils_1.model.bigNumber(),
    total: utils_1.model.bigNumber(),
    sub_order: utils_1.model.belongsTo(() => sub_order_1.default, { mappedBy: "items" }),
});
exports.default = SubOrderItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViLW9yZGVyLWl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tYXJrZXRwbGFjZS9tb2RlbHMvc3ViLW9yZGVyLWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBaUQ7QUFDakQsNERBQWtDO0FBRWxDLDRFQUE0RTtBQUM1RSxNQUFNLFlBQVksR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO0lBQ2xELEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFO0lBQzlDLFlBQVksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQzFCLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ25DLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ25DLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ25CLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3RDLFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLCtEQUErRDtJQUMvRCxhQUFhLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDN0MsUUFBUSxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUU7SUFDeEIsVUFBVSxFQUFFLGFBQUssQ0FBQyxTQUFTLEVBQUU7SUFDN0IsS0FBSyxFQUFFLGFBQUssQ0FBQyxTQUFTLEVBQUU7SUFDeEIsU0FBUyxFQUFFLGFBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsbUJBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztDQUNsRSxDQUFDLENBQUE7QUFFRixrQkFBZSxZQUFZLENBQUEifQ==