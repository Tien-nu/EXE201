"use client"

import { submitTransfer } from "@lib/data/marketplace"
import type { MarketplaceOrder } from "@lib/marketplace-types"
import { formatDateTime, formatVnd } from "@lib/util/vn-format"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useFeedback } from "@modules/common/components/feedback"
import { useEffect, useState, useTransition } from "react"

const useSecondsLeft = (deadline: string | null) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  return deadline ? Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 1000)) : 0
}

const Notice = ({ tone, children }: { tone: "info" | "success" | "danger"; children: React.ReactNode }) => (
  <div
    className={
      tone === "success"
        ? "rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        : tone === "danger"
          ? "rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
          : "rounded-md border border-violet-200 bg-violet-50 p-4 text-violet-800"
    }
  >
    {children}
  </div>
)

/** VietQR code, 10-minute countdown and the "Tôi đã chuyển khoản" button. */
export default function BankTransferBox({ order }: { order: MarketplaceOrder }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { toast } = useFeedback()
  const secondsLeft = useSecondsLeft(order.payment_deadline)

  if (order.payment_method !== "bank_transfer") {
    return null
  }

  if (order.payment_status === "paid") {
    return (
      <Notice tone="success">
        Yarnly đã nhận tiền chuyển khoản lúc {formatDateTime(order.paid_at)}. Đơn đã được gửi tới nghệ nhân.
      </Notice>
    )
  }

  if (order.payment_status === "transfer_submitted") {
    return (
      <Notice tone="info">
        Bạn đã báo chuyển khoản lúc {formatDateTime(order.transfer_submitted_at)}. Yarnly đang kiểm tra giao dịch
        và sẽ gửi email khi xác nhận.
      </Notice>
    )
  }

  if (order.payment_status === "expired" || order.payment_status === "rejected") {
    return (
      <Notice tone="danger">
        {order.payment_status === "expired"
          ? "Đơn đã bị huỷ vì quá 10 phút chưa chuyển khoản."
          : "Yarnly không nhận được tiền chuyển khoản nên đơn đã bị huỷ."}{" "}
        Nếu bạn đã chuyển, Yarnly sẽ hoàn lại tiền.
      </Notice>
    )
  }

  if (secondsLeft === 0) {
    return (
      <Notice tone="danger">
        Đã quá 10 phút. Đơn hàng sẽ bị huỷ tự động trong giây lát.
      </Notice>
    )
  }

  const bank = order.bank
  const amount = order.amount_to_transfer
  const qr = bank
    ? `https://img.vietqr.io/image/${bank.code}-${bank.account_number}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(order.transfer_content)}&accountName=${encodeURIComponent(bank.account_name ?? "")}`
    : null
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, "0")

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="txt-medium-plus">Quét mã để chuyển khoản tiền hàng</p>
      <p className="text-3xl font-semibold tabular-nums text-amber-700">
        {minutes}:{seconds}
      </p>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt="Mã VietQR"
          className="w-64 rounded-md border border-gray-200 bg-white p-2"
        />
      )}
      {bank && (
        <div className="txt-medium">
          <p>
            Ngân hàng: <strong>{bank.name}</strong>
          </p>
          <p>
            Số tài khoản: <strong>{bank.account_number}</strong> – {bank.account_name}
          </p>
        </div>
      )}
      <p className="txt-medium">
        Số tiền: <strong>{formatVnd(amount)}</strong> · Nội dung:{" "}
        <strong>{order.transfer_content}</strong>
      </p>
      <Button
        isLoading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await submitTransfer(order.order_id)
            if (result.error) toast.error(result.error)
            else toast.success("Đã báo chuyển khoản – Yarnly sẽ kiểm tra và xác nhận qua email")
            router.refresh()
          })
        }
      >
        Tôi đã chuyển khoản
      </Button>
      <p className="txt-small text-ui-fg-subtle">
        Phí ship trả cho đơn vị vận chuyển khi nhận hàng.
      </p>
    </div>
  )
}
