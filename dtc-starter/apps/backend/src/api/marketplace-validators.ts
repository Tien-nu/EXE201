import { z } from "@medusajs/framework/zod"

const requiredText = (message: string) => z.string().trim().min(1, message)

export const ArtisanProfileSchema = z.object({
  shop_name: requiredText("Vui lòng nhập tên gian hàng"),
  full_name: requiredText("Vui lòng nhập họ tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: requiredText("Vui lòng nhập số điện thoại"),
  description: z.string().nullish(),
  avatar_url: z.string().nullish(),
  pickup_address: requiredText("Vui lòng nhập địa chỉ lấy hàng"),
  bank_name: requiredText("Vui lòng nhập tên ngân hàng"),
  bank_account_number: requiredText("Vui lòng nhập số tài khoản"),
  bank_account_name: requiredText("Vui lòng nhập tên chủ tài khoản"),
})
export type ArtisanProfileBody = z.infer<typeof ArtisanProfileSchema>

// The email is the login and cannot be changed from the profile.
export const ArtisanProfileUpdateSchema = ArtisanProfileSchema.omit({ email: true })
export type ArtisanProfileUpdateBody = z.infer<typeof ArtisanProfileUpdateSchema>

export const AdminCreateArtisanSchema = ArtisanProfileSchema.extend({
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
})
export type AdminCreateArtisanBody = z.infer<typeof AdminCreateArtisanSchema>

export const ArtisanStatusSchema = z.object({
  status: z.enum(["active", "rejected", "locked"]),
  reason: z.string().nullish(),
})
export type ArtisanStatusBody = z.infer<typeof ArtisanStatusSchema>

const productBase = {
  title: requiredText("Vui lòng nhập tên sản phẩm"),
  description: z.string().nullish(),
  fulfillment_type: z.enum(["ready", "made_to_order"]),
  lead_days: z.coerce.number().int().positive().nullish(),
  images: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  status: z.enum(["published", "draft"]).optional(),
}

export const CreateArtisanProductSchema = z.object({
  ...productBase,
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  stock: z.coerce.number().int().min(0).nullish(),
})
export type CreateArtisanProductBody = z.infer<typeof CreateArtisanProductSchema>

export const UpdateArtisanProductSchema = z.object({
  ...productBase,
  variants: z.array(
    z.object({
      id: z.string(),
      price: z.coerce.number().positive("Giá phải lớn hơn 0"),
      stock: z.coerce.number().int().min(0).nullish(),
    })
  ),
})
export type UpdateArtisanProductBody = z.infer<typeof UpdateArtisanProductSchema>

export const UploadSchema = z.object({
  files: z
    .array(
      z.object({
        filename: z.string(),
        mime_type: z.string().regex(/^image\//, "Chỉ nhận file ảnh"),
        content_base64: z.string(),
      })
    )
    .min(1)
    .max(8),
})
export type UploadBody = z.infer<typeof UploadSchema>

export const ReasonSchema = z.object({
  reason: requiredText("Vui lòng nhập lý do"),
})
export type ReasonBody = z.infer<typeof ReasonSchema>

export const OptionalReasonSchema = z.object({
  reason: z.string().nullish(),
})
export type OptionalReasonBody = z.infer<typeof OptionalReasonSchema>

export const RespondCustomRequestSchema = z.object({
  accept: z.boolean(),
  price: z.coerce.number().positive().optional(),
  lead_days: z.coerce.number().int().positive().optional(),
  note: z.string().nullish(),
})
export type RespondCustomRequestBody = z.infer<typeof RespondCustomRequestSchema>

export const CreateCustomRequestSchema = z.object({
  product_id: z.string(),
  description: requiredText("Vui lòng mô tả yêu cầu của bạn"),
  color: z.string().nullish(),
  size: z.string().nullish(),
  quantity: z.coerce.number().int().min(1).max(50).optional(),
})
export type CreateCustomRequestBody = z.infer<typeof CreateCustomRequestSchema>

export const DecideCustomRequestSchema = z.object({
  accept: z.boolean(),
  cart_id: z.string().optional(),
})
export type DecideCustomRequestBody = z.infer<typeof DecideCustomRequestSchema>

export const ShipSchema = z.object({
  carrier: requiredText("Vui lòng nhập đơn vị vận chuyển"),
  tracking_number: requiredText("Vui lòng nhập mã vận đơn"),
})
export type ShipBody = z.infer<typeof ShipSchema>

export const PayoutPaidSchema = z.object({
  transaction_ref: requiredText("Vui lòng nhập mã giao dịch"),
})
export type PayoutPaidBody = z.infer<typeof PayoutPaidSchema>

export const SettingsSchema = z.object({
  platform_fee_percent: z.coerce.number().min(0).max(100),
  admin_email: z.string().email().nullish().or(z.literal("")),
  bank_name: z.string().nullish(),
  bank_code: z.string().nullish(),
  bank_account_number: z.string().nullish(),
  bank_account_name: z.string().nullish(),
})
export type SettingsBody = z.infer<typeof SettingsSchema>
