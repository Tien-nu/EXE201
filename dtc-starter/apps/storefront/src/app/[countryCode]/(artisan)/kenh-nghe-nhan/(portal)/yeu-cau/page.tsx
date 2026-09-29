import { listArtisanCustomRequests } from "@lib/data/artisan-portal"
import { CUSTOM_REQUEST_LABELS } from "@lib/marketplace-types"
import { formatDateTime, formatVnd } from "@lib/util/vn-format"
import RespondCustomRequest from "@modules/artisan-portal/components/respond-custom-request"

export default async function ArtisanCustomRequestsPage() {
  const requests = await listArtisanCustomRequests()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl-semi">Yêu cầu làm riêng</h1>
      {requests.length ? (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="txt-medium-plus">{request.product_title}</p>
                  <p className="txt-small text-ui-fg-subtle">
                    {request.customer_name ?? "Khách hàng"} · {formatDateTime(request.created_at)}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 txt-small-plus">
                  {CUSTOM_REQUEST_LABELS[request.status]}
                </span>
              </div>
              <p className="mt-2 txt-medium">
                {request.quantity} cái · {request.description}
              </p>
              {(request.color || request.size) && (
                <p className="txt-small text-ui-fg-subtle">
                  {request.color && `Màu: ${request.color}`}
                  {request.color && request.size && " · "}
                  {request.size && `Kích thước: ${request.size}`}
                </p>
              )}
              {request.quoted_price !== null && (
                <p className="mt-2 txt-small">
                  Bạn đã báo {formatVnd(request.quoted_price)}/cái · {request.quoted_lead_days} ngày
                </p>
              )}
              {request.status === "pending" && <RespondCustomRequest requestId={request.id} />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="txt-medium text-ui-fg-subtle">Chưa có yêu cầu nào.</p>
      )}
    </div>
  )
}
