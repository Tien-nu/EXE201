"use client"

import { createCustomRequest } from "@lib/data/marketplace"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { useState, useTransition } from "react"

const fieldClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 txt-medium focus:border-gray-400 focus:outline-none"

/** "Yêu cầu làm riêng": the artisan answers once with a price and making time. */
export default function CustomRequestForm({
  productId,
  isLoggedIn,
}: {
  productId: string
  isLoggedIn: boolean
}) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <p className="txt-small text-ui-fg-subtle">
        Muốn đặt làm riêng (màu, kích thước, chữ thêu…)?{" "}
        <LocalizedClientLink href="/account" className="text-violet-700 underline">
          Đăng nhập
        </LocalizedClientLink>{" "}
        để gửi yêu cầu cho nghệ nhân.
      </p>
    )
  }

  if (sent) {
    return (
      <p className="rounded-md bg-emerald-50 p-3 txt-small text-emerald-800">
        Đã gửi yêu cầu. Nghệ nhân sẽ báo giá và thời gian làm, bạn xem trong{" "}
        <LocalizedClientLink href="/account/yeu-cau-lam-rieng" className="underline">
          Tài khoản → Yêu cầu làm riêng
        </LocalizedClientLink>
        .
      </p>
    )
  }

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Yêu cầu làm riêng
      </Button>
    )
  }

  return (
    <form
      className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
      action={(formData) =>
        startTransition(async () => {
          const result = await createCustomRequest({
            product_id: productId,
            description: String(formData.get("description") ?? ""),
            color: String(formData.get("color") ?? "") || undefined,
            size: String(formData.get("size") ?? "") || undefined,
            quantity: Number(formData.get("quantity") ?? 1),
          })
          setError(result.error)
          if (!result.error) setSent(true)
        })
      }
    >
      <p className="txt-medium-plus">Yêu cầu làm riêng</p>
      <textarea
        name="description"
        required
        rows={3}
        placeholder="Mô tả mong muốn của bạn (hình dáng, chữ thêu, dịp tặng…)"
        className={fieldClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input name="color" placeholder="Màu sắc" className={fieldClass} />
        <input name="size" placeholder="Kích thước" className={fieldClass} />
      </div>
      <label className="flex items-center gap-2 txt-small">
        Số lượng
        <input
          name="quantity"
          type="number"
          min={1}
          max={50}
          defaultValue={1}
          className={`${fieldClass} w-20`}
        />
      </label>
      {error && <p className="txt-small text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="small" isLoading={pending}>
          Gửi yêu cầu
        </Button>
        <Button type="button" variant="secondary" size="small" onClick={() => setOpen(false)}>
          Huỷ
        </Button>
      </div>
    </form>
  )
}
