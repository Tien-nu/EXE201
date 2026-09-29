"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/** Single row of platform settings the admin can change. */
const MarketplaceSetting = utils_1.model.define("marketplace_setting", {
    id: utils_1.model.id({ prefix: "mpset" }).primaryKey(),
    platform_fee_percent: utils_1.model.float().default(0),
    // Gmail that receives "ready to ship" and other admin emails.
    admin_email: utils_1.model.text().nullable(),
    // Yarnly's receiving account, used for the VietQR code.
    bank_name: utils_1.model.text().nullable(),
    // VietQR bank id: a short name such as "mb" or the bank BIN.
    bank_code: utils_1.model.text().nullable(),
    bank_account_number: utils_1.model.text().nullable(),
    bank_account_name: utils_1.model.text().nullable(),
});
exports.default = MarketplaceSetting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2Utc2V0dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21hcmtldHBsYWNlL21vZGVscy9tYXJrZXRwbGFjZS1zZXR0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWlEO0FBRWpELDREQUE0RDtBQUM1RCxNQUFNLGtCQUFrQixHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUU7SUFDN0QsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDOUMsb0JBQW9CLEVBQUUsYUFBSyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDOUMsOERBQThEO0lBQzlELFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3BDLHdEQUF3RDtJQUN4RCxTQUFTLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNsQyw2REFBNkQ7SUFDN0QsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbEMsbUJBQW1CLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM1QyxpQkFBaUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQzNDLENBQUMsQ0FBQTtBQUVGLGtCQUFlLGtCQUFrQixDQUFBIn0=