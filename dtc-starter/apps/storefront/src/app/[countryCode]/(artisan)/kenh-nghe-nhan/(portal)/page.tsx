import { getArtisanDashboard } from "@lib/data/artisan-portal"
import { formatVnd } from "@lib/util/vn-format"
import { Card } from "@modules/artisan-portal/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const TODO = [
  { status: "pending_acceptance", label: "Đơn chờ bạn xác nhận", hint: "Nhận hoặc từ chối trong 12 tiếng" },
  { status: "processing", label: "Đơn đang làm / chuẩn bị", hint: "Làm xong thì bấm “Đã làm xong”" },
  { status: "ready_to_ship", label: "Chờ Yarnly tạo vận đơn", hint: "Đơn vị vận chuyển sẽ tới lấy hàng" },
  { status: "shipping", label: "Đang giao", hint: "" },
] as const

export default async function ArtisanDashboardPage() {
  const dashboard = await getArtisanDashboard()

  if (!dashboard) {
    return null
  }

  const counts = dashboard.sub_orders_by_status

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl-semi">Tổng quan</h1>
      <div className="grid grid-cols-2 gap-4 medium:grid-cols-4">
        {TODO.map((item) => (
          <LocalizedClientLink
            key={item.status}
            href={`/kenh-nghe-nhan/don-hang?status=${item.status}`}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-violet-300"
          >
            <p className="text-3xl font-semibold">{counts[item.status] ?? 0}</p>
            <p className="txt-medium-plus">{item.label}</p>
            {item.hint && <p className="txt-small text-ui-fg-subtle">{item.hint}</p>}
          </LocalizedClientLink>
        ))}
      </div>
      {dashboard.pending_custom_requests > 0 && (
        <LocalizedClientLink
          href="/kenh-nghe-nhan/yeu-cau"
          className="rounded-lg border border-violet-200 bg-violet-50 p-4 txt-medium"
        >
          Bạn có <strong>{dashboard.pending_custom_requests}</strong> yêu cầu làm riêng chờ báo giá →
        </LocalizedClientLink>
      )}
      <Card title="Thu nhập">
        <dl className="grid grid-cols-2 gap-4 medium:grid-cols-4">
          <div>
            <dt className="txt-small text-ui-fg-subtle">Đơn hoàn thành</dt>
            <dd className="txt-xlarge-plus">{formatVnd(dashboard.revenue.completed_total)}</dd>
          </div>
          <div>
            <dt className="txt-small text-ui-fg-subtle">Chờ tổng hợp (thứ Hai tới)</dt>
            <dd className="txt-xlarge-plus">{formatVnd(dashboard.revenue.awaiting_payout)}</dd>
          </div>
          <div>
            <dt className="txt-small text-ui-fg-subtle">Chờ Yarnly chuyển</dt>
            <dd className="txt-xlarge-plus">{formatVnd(dashboard.revenue.pending_payout)}</dd>
          </div>
          <div>
            <dt className="txt-small text-ui-fg-subtle">Đã nhận</dt>
            <dd className="txt-xlarge-plus">{formatVnd(dashboard.revenue.paid_out)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
