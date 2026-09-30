import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { formatDate, formatVnd, vnWeekStart } from "./format"
import { paragraph, sendEmail } from "./notify"
import { toNumber } from "./numbers"

/**
 * Creates one pending payout per artisan for every completed sub-order not
 * paid out yet, up to this Monday 00:00 (Vietnam time). Sub-orders completed
 * this week wait for next Monday. Running it twice creates nothing new.
 */
export async function generatePayouts(
  container: MedusaContainer,
  now = new Date()
) {
  const marketplace: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const cutoff = vnWeekStart(now)
  const settings = await marketplace.getSettings()
  const feePercent = Number(settings.platform_fee_percent) || 0

  const unpaid = await marketplace.listSubOrders(
    {
      status: "completed",
      payout_id: null,
      completed_at: { $lt: cutoff },
    },
    { relations: ["artisan"] }
  )

  const byArtisan = new Map<string, typeof unpaid>()

  for (const subOrder of unpaid) {
    const list = byArtisan.get(subOrder.artisan.id) ?? []
    list.push(subOrder)
    byArtisan.set(subOrder.artisan.id, list)
  }

  const created: { id: string }[] = []

  for (const subOrders of byArtisan.values()) {
    const artisan = subOrders[0].artisan
    const gross = subOrders.reduce((sum, sub) => sum + toNumber(sub.subtotal), 0)
    const fee = Math.round((gross * feePercent) / 100)
    const earliest = subOrders
      .map((sub) => new Date(sub.completed_at as Date))
      .sort((a, b) => a.getTime() - b.getTime())[0]

    const payout = await marketplace.createPayouts({
      artisan_id: artisan.id,
      period_start: vnWeekStart(earliest),
      period_end: cutoff,
      sub_order_count: subOrders.length,
      gross_amount: gross,
      fee_percent: feePercent,
      fee_amount: fee,
      net_amount: gross - fee,
      bank_name: artisan.bank_name,
      bank_account_number: artisan.bank_account_number,
      bank_account_name: artisan.bank_account_name,
      status: "pending",
    })

    await marketplace.updateSubOrders(
      subOrders.map((sub) => ({ id: sub.id, payout_id: payout.id }))
    )

    created.push(payout)
  }

  return created
}

export async function markPayoutPaid(
  container: MedusaContainer,
  payoutId: string,
  transactionRef: string
) {
  const marketplace: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const payout = await marketplace.retrievePayout(payoutId, {
    relations: ["artisan"],
  })

  if (payout.status === "paid") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Kỳ này đã được đánh dấu chuyển tiền"
    )
  }

  const updated = await marketplace.updatePayouts({
    id: payout.id,
    status: "paid",
    paid_at: new Date(),
    transaction_ref: transactionRef,
  })

  await sendEmail(
    container,
    payout.artisan.email,
    `Yarnly đã chuyển ${formatVnd(payout.net_amount)} cho bạn`,
    paragraph(
      `Yarnly đã chuyển <b>${formatVnd(payout.net_amount)}</b> cho ${payout.sub_order_count} đơn hoàn thành từ ${formatDate(payout.period_start)} đến trước ${formatDate(payout.period_end)}.`
    ) +
      paragraph(
        `Tổng tiền hàng: ${formatVnd(payout.gross_amount)} – phí sàn ${payout.fee_percent}%: ${formatVnd(payout.fee_amount)}<br/>Tài khoản nhận: ${payout.bank_name} ${payout.bank_account_number}<br/>Mã giao dịch: ${transactionRef}`
      )
  )

  return updated
}
