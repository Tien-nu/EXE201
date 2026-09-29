"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FULFILLMENT_TYPES = exports.SUB_ORDER_STATUS_LABELS = exports.STOREFRONT_URL = exports.DAY = exports.HOUR = exports.MINUTE = exports.HOUSE_ARTISAN_HANDLE = exports.VN_UTC_OFFSET_HOURS = exports.AUTO_COMPLETE_DAYS = exports.ACCEPT_WINDOW_HOURS = exports.PAYMENT_WINDOW_MINUTES = void 0;
/** Minutes a customer has to make the bank transfer. */
exports.PAYMENT_WINDOW_MINUTES = 10;
/** Hours an artisan has to accept a new sub-order. */
exports.ACCEPT_WINDOW_HOURS = 12;
/** Days after delivery before a sub-order completes by itself. */
exports.AUTO_COMPLETE_DAYS = 2;
/** Vietnam has no daylight saving time, so UTC+7 all year. */
exports.VN_UTC_OFFSET_HOURS = 7;
/** Artisan every product without an owner falls back to. */
exports.HOUSE_ARTISAN_HANDLE = "yarnly";
exports.MINUTE = 60 * 1000;
exports.HOUR = 60 * exports.MINUTE;
exports.DAY = 24 * exports.HOUR;
exports.STOREFRONT_URL = process.env.STOREFRONT_URL || "http://localhost:8000/vn";
exports.SUB_ORDER_STATUS_LABELS = {
    pending_payment: "Chờ thanh toán",
    pending_acceptance: "Chờ nghệ nhân xác nhận",
    processing: "Đang làm / chuẩn bị",
    ready_to_ship: "Đã làm xong – chờ giao hàng",
    shipping: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    canceled: "Đã huỷ",
};
exports.FULFILLMENT_TYPES = ["ready", "made_to_order"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdEO0FBQzNDLFFBQUEsc0JBQXNCLEdBQUcsRUFBRSxDQUFBO0FBRXhDLHNEQUFzRDtBQUN6QyxRQUFBLG1CQUFtQixHQUFHLEVBQUUsQ0FBQTtBQUVyQyxrRUFBa0U7QUFDckQsUUFBQSxrQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFFbkMsOERBQThEO0FBQ2pELFFBQUEsbUJBQW1CLEdBQUcsQ0FBQyxDQUFBO0FBRXBDLDREQUE0RDtBQUMvQyxRQUFBLG9CQUFvQixHQUFHLFFBQVEsQ0FBQTtBQUUvQixRQUFBLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUEsSUFBSSxHQUFHLEVBQUUsR0FBRyxjQUFNLENBQUE7QUFDbEIsUUFBQSxHQUFHLEdBQUcsRUFBRSxHQUFHLFlBQUksQ0FBQTtBQUVmLFFBQUEsY0FBYyxHQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSwwQkFBMEIsQ0FBQTtBQUU3QyxRQUFBLHVCQUF1QixHQUEyQjtJQUM3RCxlQUFlLEVBQUUsZ0JBQWdCO0lBQ2pDLGtCQUFrQixFQUFFLHdCQUF3QjtJQUM1QyxVQUFVLEVBQUUscUJBQXFCO0lBQ2pDLGFBQWEsRUFBRSw2QkFBNkI7SUFDNUMsUUFBUSxFQUFFLFdBQVc7SUFDckIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsU0FBUyxFQUFFLFlBQVk7SUFDdkIsUUFBUSxFQUFFLFFBQVE7Q0FDbkIsQ0FBQTtBQUVZLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFVLENBQUEifQ==