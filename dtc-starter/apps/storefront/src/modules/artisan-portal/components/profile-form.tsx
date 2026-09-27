"use client"

import { updateArtisanProfile } from "@lib/data/artisan-portal"
import type { Artisan } from "@lib/marketplace-types"
import { Button } from "@modules/common/components/ui"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Field, fieldClass } from "../ui"

const FIELDS: { name: keyof Artisan; label: string; hint?: string }[] = [
  { name: "shop_name", label: "Tên gian hàng" },
  { name: "full_name", label: "Họ tên" },
  { name: "phone", label: "Số điện thoại" },
  { name: "pickup_address", label: "Địa chỉ lấy hàng", hint: "Đơn vị vận chuyển tới đây lấy hàng" },
  { name: "bank_name", label: "Ngân hàng nhận tiền" },
  { name: "bank_account_number", label: "Số tài khoản" },
  { name: "bank_account_name", label: "Chủ tài khoản" },
]

const Save = () => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" isLoading={pending}>
      Lưu
    </Button>
  )
}

export default function ProfileForm({ artisan }: { artisan: Artisan }) {
  const [state, action] = useActionState(updateArtisanProfile, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Email đăng nhập">
        <input value={artisan.email} disabled className={`${fieldClass} bg-gray-50`} />
      </Field>
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        {FIELDS.map((field) => (
          <Field key={field.name} label={field.label} hint={field.hint}>
            <input
              name={field.name}
              required
              defaultValue={state?.values?.[field.name] ?? String(artisan[field.name] ?? "")}
              className={fieldClass}
            />
          </Field>
        ))}
      </div>
      <Field label="Giới thiệu gian hàng">
        <textarea
          name="description"
          rows={3}
          defaultValue={state?.values?.description ?? artisan.description ?? ""}
          className={fieldClass}
        />
      </Field>
      {state?.error && <p className="txt-small text-red-600">{state.error}</p>}
      {state?.success && <p className="txt-small text-emerald-700">Đã lưu.</p>}
      <div>
        <Save />
      </div>
    </form>
  )
}
