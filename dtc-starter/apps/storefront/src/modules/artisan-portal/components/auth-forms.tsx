"use client"

import { artisanLogin, artisanRegister } from "@lib/data/artisan-portal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { useParams } from "next/navigation"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Field, fieldClass } from "../ui"

const Submit = ({ children }: { children: React.ReactNode }) => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" isLoading={pending}>
      {children}
    </Button>
  )
}

export const ArtisanLoginForm = () => {
  const { countryCode } = useParams() as { countryCode: string }
  const [state, action] = useActionState(artisanLogin, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="country_code" value={countryCode} />
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.values?.email ?? ""}
          className={fieldClass}
        />
      </Field>
      <Field label="Mật khẩu">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </Field>
      {state?.error && <p className="txt-small text-red-600">{state.error}</p>}
      <Submit>Đăng nhập</Submit>
      <p className="txt-small text-center text-ui-fg-subtle">
        Chưa có gian hàng?{" "}
        <LocalizedClientLink href="/kenh-nghe-nhan/dang-ky" className="text-violet-700 underline">
          Đăng ký làm nghệ nhân
        </LocalizedClientLink>
      </p>
    </form>
  )
}

const REGISTER_FIELDS: {
  name: string
  label: string
  type?: string
  hint?: string
  required?: boolean
}[] = [
  { name: "shop_name", label: "Tên gian hàng", required: true },
  { name: "full_name", label: "Họ tên", required: true },
  { name: "email", label: "Email (dùng để đăng nhập)", type: "email", required: true },
  { name: "password", label: "Mật khẩu", type: "password", hint: "Tối thiểu 8 ký tự", required: true },
  { name: "phone", label: "Số điện thoại", required: true },
  {
    name: "pickup_address",
    label: "Địa chỉ lấy hàng",
    hint: "Đơn vị vận chuyển sẽ tới đây lấy hàng",
    required: true,
  },
  { name: "bank_name", label: "Ngân hàng nhận tiền", required: true },
  { name: "bank_account_number", label: "Số tài khoản", required: true },
  { name: "bank_account_name", label: "Chủ tài khoản", required: true },
]

export const ArtisanRegisterForm = () => {
  const { countryCode } = useParams() as { countryCode: string }
  const [state, action] = useActionState(artisanRegister, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="country_code" value={countryCode} />
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        {REGISTER_FIELDS.map((field) => (
          <Field key={field.name} label={field.label} hint={field.hint}>
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              defaultValue={field.type === "password" ? undefined : state?.values?.[field.name] ?? ""}
              className={fieldClass}
            />
          </Field>
        ))}
      </div>
      <Field label="Giới thiệu gian hàng (tuỳ chọn)">
        <textarea
          name="description"
          rows={3}
          defaultValue={state?.values?.description ?? ""}
          className={fieldClass}
        />
      </Field>
      <p className="txt-small text-ui-fg-subtle">
        Yarnly nhận tiền từ khách và chuyển cho bạn mỗi thứ Hai (phí sàn hiện tại 0%). Tài khoản
        cần Admin duyệt trước khi bán.
      </p>
      {state?.error && <p className="txt-small text-red-600">{state.error}</p>}
      <Submit>Đăng ký</Submit>
      <p className="txt-small text-center text-ui-fg-subtle">
        Đã có gian hàng?{" "}
        <LocalizedClientLink href="/kenh-nghe-nhan/dang-nhap" className="text-violet-700 underline">
          Đăng nhập
        </LocalizedClientLink>
      </p>
    </form>
  )
}
