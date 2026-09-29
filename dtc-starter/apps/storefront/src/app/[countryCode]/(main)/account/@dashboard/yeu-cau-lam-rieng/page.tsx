import { listCustomRequests } from "@lib/data/marketplace"
import CustomerCustomRequests from "@modules/marketplace/components/customer-custom-requests"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Yêu cầu làm riêng",
}

export default async function CustomRequestsPage() {
  const requests = await listCustomRequests()

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Yêu cầu làm riêng</h1>
        <p className="text-base-regular">
          Nghệ nhân trả lời một lần bằng giá và thời gian làm. Bạn đồng ý thì món đồ được
          thêm vào giỏ với giá đã báo.
        </p>
      </div>
      <CustomerCustomRequests requests={requests} />
    </div>
  )
}
