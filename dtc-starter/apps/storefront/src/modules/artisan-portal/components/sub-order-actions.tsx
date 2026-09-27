"use client"

import {
  acceptSubOrder,
  declineSubOrder,
  markSubOrderReady,
} from "@lib/data/artisan-portal"
import type { ArtisanSubOrder } from "@lib/marketplace-types"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

/** The only buttons an artisan has: accept / decline within 12h, then "done". */
export default function SubOrderActions({ subOrder }: { subOrder: ArtisanSubOrder }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<{ error: string | null }>) =>
    startTransition(async () => {
      const result = await action()
      setError(result.error)
      router.refresh()
    })

  if (subOrder.status === "pending_acceptance") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button isLoading={pending} onClick={() => run(() => acceptSubOrder(subOrder.id))}>
            Nhận đơn
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              const reason = window.prompt("Lý do từ chối đơn (khách sẽ thấy lý do này):")
              if (reason?.trim()) {
                run(() => declineSubOrder(subOrder.id, reason.trim()))
              }
            }}
          >
            Từ chối
          </Button>
        </div>
        {error && <p className="txt-small text-red-600">{error}</p>}
      </div>
    )
  }

  if (subOrder.status === "processing") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          isLoading={pending}
          onClick={() => {
            if (window.confirm("Xác nhận đã làm xong và đóng gói? Yarnly sẽ tạo đơn vận chuyển tới lấy hàng.")) {
              run(() => markSubOrderReady(subOrder.id))
            }
          }}
        >
          Đã làm xong – chờ giao hàng
        </Button>
        {error && <p className="txt-small text-red-600">{error}</p>}
      </div>
    )
  }

  return null
}
