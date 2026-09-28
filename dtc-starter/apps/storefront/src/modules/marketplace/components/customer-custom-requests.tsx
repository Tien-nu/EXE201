"use client"

import { decideCustomRequest } from "@lib/data/marketplace"
import {
  CUSTOM_REQUEST_LABELS,
  type CustomRequest,
} from "@lib/marketplace-types"
import { formatDateTime, formatVnd } from "@lib/util/vn-format"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useFeedback } from "@modules/common/components/feedback"
import { useTransition } from "react"

const RequestCard = ({ request }: { request: CustomRequest }) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [pending, startTransition] = useTransition()
  const { confirm, toast } = useFeedback()

  const decide = (accept: boolean) =>
    startTransition(async () => {
      const result = await decideCustomRequest(request.id, accept, countryCode)

      if (result.error) {
        toast.error(result.error)
      } else if (accept) {
        toast.success(`Đã thêm "${request.product_title}" vào giỏ với giá nghệ nhân báo`)
        router.push(`/${countryCode}/cart`)
        return
      } else {
        toast.info("Bạn đã từ chối báo giá")
      }

      router.refresh()
    })

  const decline = async () => {
    const ok = await confirm({
      title: "Từ chối báo giá này?",
      description: "Bạn chỉ được quyết định một lần. Sau khi từ chối, yêu cầu này sẽ kết thúc.",
      confirmText: "Từ chối",
      cancelText: "Suy nghĩ thêm",
      tone: "danger",
    })
    if (ok) decide(false)
  }

  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="txt-medium-plus">{request.product_title}</p>
          <p className="txt-small text-ui-fg-subtle">
            {request.artisan?.shop_name} · gửi lúc {formatDateTime(request.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 txt-small-plus">
          {CUSTOM_REQUEST_LABELS[request.status]}
        </span>
      </div>
      <p className="mt-2 txt-medium">
        {request.quantity} cái · {request.description}
        {request.color && ` · Màu: ${request.color}`}
        {request.size && ` · Kích thước: ${request.size}`}
      </p>
      {request.quoted_price !== null && (
        <div className="mt-3 rounded-md bg-violet-50 p-3 txt-medium">
          Báo giá: <strong>{formatVnd(request.quoted_price * request.quantity)}</strong> (
          {formatVnd(request.quoted_price)}/cái) · làm trong{" "}
          <strong>{request.quoted_lead_days} ngày</strong>
          {request.artisan_note && (
            <p className="txt-small text-ui-fg-subtle">Lời nhắn: {request.artisan_note}</p>
          )}
        </div>
      )}
      {request.status === "artisan_declined" && request.artisan_note && (
        <p className="mt-2 txt-small text-ui-fg-subtle">Lời nhắn: {request.artisan_note}</p>
      )}
      {request.status === "quoted" && (
        <div className="mt-3 flex gap-2">
          <Button size="small" isLoading={pending} onClick={() => decide(true)}>
            Đồng ý & thêm vào giỏ
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={pending}
            onClick={decline}
          >
            Từ chối
          </Button>
        </div>
      )}
      {request.status === "accepted" && (
        <div className="mt-3 flex items-center gap-3">
          <LocalizedClientLink href="/cart" className="txt-small text-violet-700 underline">
            Tới giỏ hàng để thanh toán
          </LocalizedClientLink>
          <Button size="small" variant="secondary" isLoading={pending} onClick={() => decide(true)}>
            Thêm lại vào giỏ
          </Button>
        </div>
      )}
      {request.status === "ordered" && request.order_id && (
        <LocalizedClientLink
          href={`/account/orders/details/${request.order_id}`}
          className="mt-3 inline-block txt-small text-violet-700 underline"
        >
          Xem đơn hàng
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default function CustomerCustomRequests({ requests }: { requests: CustomRequest[] }) {
  if (!requests.length) {
    return (
      <p className="txt-medium text-ui-fg-subtle">
        Bạn chưa gửi yêu cầu làm riêng nào. Vào trang sản phẩm và bấm &quot;Yêu cầu làm riêng&quot;.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}
