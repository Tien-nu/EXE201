import { listArtisanSubOrders } from "@lib/data/artisan-portal"
import { SUB_ORDER_BADGE, formatDateTime, formatVnd } from "@lib/util/vn-format"
import SubOrderNextStep from "@modules/artisan-portal/components/sub-order-summary"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

const TABS = [
  { status: "", label: "Tất cả" },
  { status: "pending_acceptance", label: "Chờ xác nhận" },
  { status: "processing", label: "Đang làm" },
  { status: "ready_to_ship", label: "Chờ giao" },
  { status: "shipping", label: "Đang giao" },
  { status: "completed", label: "Hoàn thành" },
  { status: "canceled", label: "Đã huỷ" },
]

export default async function ArtisanOrdersPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "" } = await props.searchParams
  const subOrders = await listArtisanSubOrders(status || undefined)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl-semi">Đơn hàng</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <LocalizedClientLink
            key={tab.status}
            href={`/kenh-nghe-nhan/don-hang${tab.status ? `?status=${tab.status}` : ""}`}
            className={clx(
              "rounded-full border px-3 py-1 txt-small",
              tab.status === status
                ? "border-violet-300 bg-violet-100 text-violet-800"
                : "border-gray-200 bg-white"
            )}
          >
            {tab.label}
          </LocalizedClientLink>
        ))}
      </div>
      {subOrders.length ? (
        <ul className="flex flex-col gap-3">
          {subOrders.map((subOrder) => (
            <li key={subOrder.id}>
              <LocalizedClientLink
                href={`/kenh-nghe-nhan/don-hang/${subOrder.id}`}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:border-violet-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="txt-medium-plus">
                    Đơn {subOrder.code}
                    {subOrder.is_custom && (
                      <span className="ml-2 txt-small text-violet-700">Làm riêng</span>
                    )}
                  </span>
                  <span className={`rounded-full px-3 py-1 txt-small-plus ${SUB_ORDER_BADGE[subOrder.status]}`}>
                    {subOrder.status_label}
                  </span>
                </div>
                <p className="txt-medium">
                  {subOrder.items.map((item) => `${item.quantity} × ${item.title}`).join(", ")}
                </p>
                <div className="flex flex-wrap justify-between gap-2 txt-small text-ui-fg-subtle">
                  <span>
                    <SubOrderNextStep subOrder={subOrder} />
                  </span>
                  <span>
                    {formatVnd(subOrder.subtotal)} ·{" "}
                    {subOrder.payment_method === "cod" ? "COD" : "Đã chuyển khoản"} ·{" "}
                    {formatDateTime(subOrder.created_at)}
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="txt-medium text-ui-fg-subtle">Không có đơn nào.</p>
      )}
    </div>
  )
}
