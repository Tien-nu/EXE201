"use client"

import { cancelSubOrder } from "@lib/data/marketplace"
import type { CustomerSubOrder } from "@lib/marketplace-types"
import {
  SUB_ORDER_BADGE,
  formatDate,
  formatDateTime,
  formatVnd,
} from "@lib/util/vn-format"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

const Hint = ({ subOrder }: { subOrder: CustomerSubOrder }) => {
  switch (subOrder.status) {
    case "pending_payment":
      return <>Chờ bạn chuyển khoản.</>
    case "pending_acceptance":
      return <>Nghệ nhân sẽ xác nhận trước {formatDateTime(subOrder.accept_deadline)}.</>
    case "processing":
      return subOrder.due_date ? (
        <>Nghệ nhân đang làm, dự kiến xong trước {formatDate(subOrder.due_date)}.</>
      ) : (
        <>Nghệ nhân đang chuẩn bị hàng.</>
      )
    case "ready_to_ship":
      return <>Đã làm xong, Yarnly đang tạo đơn vận chuyển.</>
    case "shipping":
      return (
        <>
          {subOrder.carrier} – mã vận đơn <strong>{subOrder.tracking_number}</strong>. Phí ship trả khi nhận.
        </>
      )
    case "delivered":
      return <>Đã giao lúc {formatDateTime(subOrder.delivered_at)}, tự hoàn thành sau 2 ngày.</>
    case "completed":
      return <>Hoàn thành. Cảm ơn bạn!</>
    case "canceled":
      return (
        <>
          {subOrder.cancel_reason}
          {subOrder.refund_status === "pending" && " · Yarnly sẽ hoàn tiền cho bạn."}
          {subOrder.refund_status === "refunded" && " · Đã hoàn tiền."}
        </>
      )
    default:
      return null
  }
}

const SubOrderCard = ({ subOrder }: { subOrder: CustomerSubOrder }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const canCancel = ["pending_payment", "pending_acceptance"].includes(subOrder.status)

  return (
    <div className="rounded-md border border-gray-200 p-4" data-testid="sub-order">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="txt-medium-plus">
            Đơn {subOrder.code}
            {subOrder.artisan && (
              <>
                {" · "}
                <LocalizedClientLink
                  href={`/nghe-nhan/${subOrder.artisan.handle}`}
                  className="text-violet-700 hover:underline"
                >
                  {subOrder.artisan.shop_name}
                </LocalizedClientLink>
              </>
            )}
          </p>
          {subOrder.is_custom && (
            <p className="txt-small text-violet-700">Làm theo yêu cầu riêng</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 txt-small-plus ${SUB_ORDER_BADGE[subOrder.status]}`}
        >
          {subOrder.status_label}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1 txt-medium">
        {subOrder.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.quantity} × {item.title}
              {item.variant_title && (
                <span className="text-ui-fg-subtle"> ({item.variant_title})</span>
              )}
            </span>
            <span>{formatVnd(item.total)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 txt-small text-ui-fg-subtle">
        <Hint subOrder={subOrder} />
      </p>
      {canCancel && (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="small"
            isLoading={pending}
            onClick={() => {
              if (!window.confirm(`Huỷ đơn ${subOrder.code}?`)) return
              startTransition(async () => {
                const result = await cancelSubOrder(subOrder.id)
                setError(result.error)
                router.refresh()
              })
            }}
          >
            Huỷ đơn này
          </Button>
          {error && <p className="mt-1 txt-small text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function SubOrderList({ subOrders }: { subOrders: CustomerSubOrder[] }) {
  return (
    <div className="flex flex-col gap-3">
      {subOrders.map((subOrder) => (
        <SubOrderCard key={subOrder.id} subOrder={subOrder} />
      ))}
    </div>
  )
}
