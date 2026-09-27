"use client"

import { respondCustomRequest } from "@lib/data/artisan-portal"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Field, fieldClass } from "../ui"

/** One answer only: a price per item and the making time, or a refusal. */
export default function RespondCustomRequest({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const submit = (formData: FormData, accept: boolean) =>
    startTransition(async () => {
      const result = await respondCustomRequest(requestId, {
        accept,
        price: accept ? Number(formData.get("price")) : undefined,
        lead_days: accept ? Number(formData.get("lead_days")) : undefined,
        note: String(formData.get("note") ?? "") || undefined,
      })
      setError(result.error)
      router.refresh()
    })

  return (
    <form
      className="mt-3 flex flex-col gap-3 rounded-md bg-gray-50 p-3"
      action={(formData) => submit(formData, true)}
    >
      <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
        <Field label="Giá mỗi cái (₫)">
          <input name="price" type="number" min={1000} step={1000} required className={fieldClass} />
        </Field>
        <Field label="Số ngày làm">
          <input name="lead_days" type="number" min={1} max={120} required className={fieldClass} />
        </Field>
      </div>
      <Field label="Lời nhắn cho khách (tuỳ chọn)">
        <input name="note" className={fieldClass} />
      </Field>
      <p className="txt-small text-ui-fg-subtle">
        Bạn chỉ trả lời được một lần. Khách đồng ý thì đơn vào thẳng trạng thái “Đang làm” sau khi thanh toán.
      </p>
      {error && <p className="txt-small text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="small" isLoading={pending}>
          Gửi báo giá
        </Button>
        <Button
          type="button"
          size="small"
          variant="secondary"
          disabled={pending}
          onClick={(event) => {
            if (!window.confirm("Từ chối yêu cầu này?")) return
            submit(new FormData(event.currentTarget.form ?? undefined), false)
          }}
        >
          Từ chối
        </Button>
      </div>
    </form>
  )
}
