import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { listOrders } from "@lib/data/orders"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  // An expired or invalid login must not crash the page.
  const orders = await listOrders().catch(() => null)

  if (!orders) {
    return (
      <div className="w-full" data-testid="orders-page-wrapper">
        <h1 className="text-2xl-semi mb-4">Orders</h1>
        <p className="text-base-regular">
          Không tải được đơn hàng – có thể phiên đăng nhập đã hết hạn.{" "}
          <LocalizedClientLink href="/account" className="text-violet-700 underline">
            Đăng nhập lại
          </LocalizedClientLink>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Orders</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        <Divider className="mb-8 mt-8" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
