"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const artisans_1 = require("../../../../lib/marketplace/artisans");
const serialize_1 = require("../../../../lib/marketplace/serialize");
const marketplace_1 = require("../../../../modules/marketplace");
async function GET(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const marketplace = req.scope.resolve(marketplace_1.MARKETPLACE_MODULE);
    const [subOrder] = await marketplace.listSubOrders({ id: req.params.id, artisan_id: artisan.id }, { relations: ["items", "marketplace_order"] });
    if (!subOrder || subOrder.status === "pending_payment") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Không tìm thấy đơn hàng");
    }
    const customRequest = subOrder.custom_request_id
        ? await marketplace.retrieveCustomRequest(subOrder.custom_request_id)
        : undefined;
    res.json({ sub_order: (0, serialize_1.subOrderForArtisan)(subOrder, customRequest) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vc3ViLW9yZGVycy9baWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsa0JBa0JDO0FBeEJELHFEQUF1RDtBQUN2RCxtRUFBdUU7QUFDdkUscUVBQTBFO0FBQzFFLGlFQUFvRTtBQUc3RCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDJCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sV0FBVyxHQUE2QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBRW5GLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQ2hELEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQzdDLEVBQUUsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLEVBQUUsQ0FDOUMsQ0FBQTtJQUVELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQyxDQUFBO0lBQy9FLENBQUM7SUFFRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsaUJBQWlCO1FBQzlDLENBQUMsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7UUFDckUsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUViLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBQSw4QkFBa0IsRUFBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3RFLENBQUMifQ==