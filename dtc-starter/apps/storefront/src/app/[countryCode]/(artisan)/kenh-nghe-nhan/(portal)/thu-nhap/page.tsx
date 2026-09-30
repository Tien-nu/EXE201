import { listArtisanPayouts } from "@lib/data/artisan-portal"
import { formatDate, formatDateTime, formatVnd } from "@lib/util/vn-format"
import { Card } from "@modules/artisan-portal/ui"

export default async function ArtisanPayoutsPage() {
  const payouts = await listArtisanPayouts()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl-semi">Thu nhập</h1>
      <p className="txt-medium text-ui-fg-subtle">
        Mỗi thứ Hai, Yarnly tổng hợp các đơn hoàn thành tuần trước và chuyển khoản vào tài khoản
        trong hồ sơ của bạn. Phí sàn hiện tại: 0%.
      </p>
      <Card>
        {payouts.length ? (
          <table className="w-full txt-medium">
            <thead className="text-left txt-small text-ui-fg-subtle">
              <tr>
                <th className="py-2">Kỳ</th>
                <th>Số đơn</th>
                <th>Tiền hàng</th>
                <th>Phí sàn</th>
                <th>Thực nhận</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-gray-100">
                  <td className="py-2">
                    {formatDate(payout.period_start)} – {formatDate(payout.period_end)}
                  </td>
                  <td>{payout.sub_order_count}</td>
                  <td>{formatVnd(payout.gross_amount)}</td>
                  <td>{payout.fee_percent}%</td>
                  <td className="font-semibold">{formatVnd(payout.net_amount)}</td>
                  <td>
                    {payout.status === "paid" ? (
                      <span className="text-emerald-700">
                        Đã chuyển {formatDateTime(payout.paid_at)}
                        <br />
                        <span className="txt-small text-ui-fg-subtle">Mã GD: {payout.transaction_ref}</span>
                      </span>
                    ) : (
                      <span className="text-amber-700">Chờ Yarnly chuyển</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="txt-medium text-ui-fg-subtle">Chưa có kỳ chuyển tiền nào.</p>
        )}
      </Card>
    </div>
  )
}
