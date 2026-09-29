"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
// Guests may browse and fill a cart, but only registered customers can pay.
core_flows_1.completeCartWorkflow.hooks.validate(async ({ cart }) => {
    const customer = cart
        .customer;
    if (!customer?.has_account) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Vui lòng đăng nhập hoặc đăng ký để thanh toán");
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZS1jdXN0b21lci1hY2NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9ob29rcy9yZXF1aXJlLWN1c3RvbWVyLWFjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBdUQ7QUFDdkQsNERBQWtFO0FBRWxFLDRFQUE0RTtBQUM1RSxpQ0FBb0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7SUFDckQsTUFBTSxRQUFRLEdBQUksSUFBd0Q7U0FDdkUsUUFBUSxDQUFBO0lBRVgsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUMzQixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUM3QiwrQ0FBK0MsQ0FDaEQsQ0FBQTtJQUNILENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQSJ9