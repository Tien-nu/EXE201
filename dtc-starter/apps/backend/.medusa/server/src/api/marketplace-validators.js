"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = exports.PayoutPaidSchema = exports.ShipSchema = exports.DecideCustomRequestSchema = exports.CreateCustomRequestSchema = exports.RespondCustomRequestSchema = exports.OptionalReasonSchema = exports.ReasonSchema = exports.UploadSchema = exports.UpdateArtisanProductSchema = exports.CreateArtisanProductSchema = exports.ArtisanStatusSchema = exports.AdminCreateArtisanSchema = exports.ArtisanProfileUpdateSchema = exports.ArtisanProfileSchema = void 0;
const zod_1 = require("@medusajs/framework/zod");
const requiredText = (message) => zod_1.z.string().trim().min(1, message);
exports.ArtisanProfileSchema = zod_1.z.object({
    shop_name: requiredText("Vui lòng nhập tên gian hàng"),
    full_name: requiredText("Vui lòng nhập họ tên"),
    email: zod_1.z.string().trim().email("Email không hợp lệ"),
    phone: requiredText("Vui lòng nhập số điện thoại"),
    description: zod_1.z.string().nullish(),
    avatar_url: zod_1.z.string().nullish(),
    pickup_address: requiredText("Vui lòng nhập địa chỉ lấy hàng"),
    // GHN administrative units of the pickup address (needed to book GHN).
    pickup_province_name: zod_1.z.string().nullish(),
    pickup_district_id: zod_1.z.coerce.number().int().positive().nullish(),
    pickup_district_name: zod_1.z.string().nullish(),
    pickup_ward_code: zod_1.z.string().nullish(),
    pickup_ward_name: zod_1.z.string().nullish(),
    bank_name: requiredText("Vui lòng nhập tên ngân hàng"),
    bank_account_number: requiredText("Vui lòng nhập số tài khoản"),
    bank_account_name: requiredText("Vui lòng nhập tên chủ tài khoản"),
});
// The email is the login and cannot be changed from the profile.
exports.ArtisanProfileUpdateSchema = exports.ArtisanProfileSchema.omit({ email: true });
exports.AdminCreateArtisanSchema = exports.ArtisanProfileSchema.extend({
    password: zod_1.z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});
exports.ArtisanStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["active", "rejected", "locked"]),
    reason: zod_1.z.string().nullish(),
});
const productBase = {
    title: requiredText("Vui lòng nhập tên sản phẩm"),
    description: zod_1.z.string().nullish(),
    fulfillment_type: zod_1.z.enum(["ready", "made_to_order"]),
    lead_days: zod_1.z.coerce.number().int().positive().nullish(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    category_ids: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["published", "draft"]).optional(),
};
exports.CreateArtisanProductSchema = zod_1.z.object({
    ...productBase,
    price: zod_1.z.coerce.number().positive("Giá phải lớn hơn 0"),
    stock: zod_1.z.coerce.number().int().min(0).nullish(),
});
exports.UpdateArtisanProductSchema = zod_1.z.object({
    ...productBase,
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        price: zod_1.z.coerce.number().positive("Giá phải lớn hơn 0"),
        stock: zod_1.z.coerce.number().int().min(0).nullish(),
    })),
});
exports.UploadSchema = zod_1.z.object({
    files: zod_1.z
        .array(zod_1.z.object({
        filename: zod_1.z.string(),
        mime_type: zod_1.z.string().regex(/^image\//, "Chỉ nhận file ảnh"),
        content_base64: zod_1.z.string(),
    }))
        .min(1)
        .max(8),
});
exports.ReasonSchema = zod_1.z.object({
    reason: requiredText("Vui lòng nhập lý do"),
});
exports.OptionalReasonSchema = zod_1.z.object({
    reason: zod_1.z.string().nullish(),
});
exports.RespondCustomRequestSchema = zod_1.z.object({
    accept: zod_1.z.boolean(),
    price: zod_1.z.coerce.number().positive().optional(),
    lead_days: zod_1.z.coerce.number().int().positive().optional(),
    note: zod_1.z.string().nullish(),
});
exports.CreateCustomRequestSchema = zod_1.z.object({
    product_id: zod_1.z.string(),
    description: requiredText("Vui lòng mô tả yêu cầu của bạn"),
    color: zod_1.z.string().nullish(),
    size: zod_1.z.string().nullish(),
    quantity: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
exports.DecideCustomRequestSchema = zod_1.z.object({
    accept: zod_1.z.boolean(),
    cart_id: zod_1.z.string().optional(),
});
exports.ShipSchema = zod_1.z.object({
    carrier: requiredText("Vui lòng nhập đơn vị vận chuyển"),
    tracking_number: requiredText("Vui lòng nhập mã vận đơn"),
});
exports.PayoutPaidSchema = zod_1.z.object({
    transaction_ref: requiredText("Vui lòng nhập mã giao dịch"),
});
exports.SettingsSchema = zod_1.z.object({
    platform_fee_percent: zod_1.z.coerce.number().min(0).max(100),
    admin_email: zod_1.z.string().email().nullish().or(zod_1.z.literal("")),
    bank_name: zod_1.z.string().nullish(),
    bank_code: zod_1.z.string().nullish(),
    bank_account_number: zod_1.z.string().nullish(),
    bank_account_name: zod_1.z.string().nullish(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2UtdmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGkvbWFya2V0cGxhY2UtdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBMkM7QUFFM0MsTUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBRTlELFFBQUEsb0JBQW9CLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMzQyxTQUFTLEVBQUUsWUFBWSxDQUFDLDZCQUE2QixDQUFDO0lBQ3RELFNBQVMsRUFBRSxZQUFZLENBQUMsc0JBQXNCLENBQUM7SUFDL0MsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUM7SUFDcEQsS0FBSyxFQUFFLFlBQVksQ0FBQyw2QkFBNkIsQ0FBQztJQUNsRCxXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUNqQyxVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUNoQyxjQUFjLEVBQUUsWUFBWSxDQUFDLGdDQUFnQyxDQUFDO0lBQzlELHVFQUF1RTtJQUN2RSxvQkFBb0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFO0lBQzFDLGtCQUFrQixFQUFFLE9BQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFO0lBQ2hFLG9CQUFvQixFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDMUMsZ0JBQWdCLEVBQUUsT0FBQyxDQUFDLE1B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