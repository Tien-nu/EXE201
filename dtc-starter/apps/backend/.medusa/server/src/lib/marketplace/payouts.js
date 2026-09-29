"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayouts = generatePayouts;
exports.markPayoutPaid = markPayoutPaid;
const utils_1 = require("@medusajs/framework/utils");
const marketplace_1 = require("../../modules/marketplace");
const format_1 = require("./format");
const notify_1 = require("./notify");
const numbers_1 = require("./numbers");
/**
 * Creates one pending payout per artisan for every completed sub-order not
 * paid out yet, up to this Monday 00:00 (Vietnam time). Sub-orders completed
 * this week wait for next Monday. Running it twice creates nothing new.
 */
async function generatePayouts(container, now = new Date()) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const cutoff = (0, format_1.vnWeekStart)(now);
    const settings = await marketplace.getSettings();
    const feePercent = Number(settings.platform_fee_percent) || 0;
    const unpaid = await marketplace.listSubOrders({
        status: "completed",
        payout_id: null,
        completed_at: { $lt: cutoff },
    }, { relations: ["artisan"] });
    const byArtisan = new Map();
    for (const subOrder of unpaid) {
        const list = byArtisan.get(subOrder.artisan.id) ?? [];
        list.push(subOrder);
        byArtisan.set(subOrder.artisan.id, list);
    }
    const created = [];
    for (const subOrders of byArtisan.values()) {
        const artisan = subOrders[0].artisan;
        const gross = subOrders.reduce((sum, sub) => sum + (0, numbers_1.toNumber)(sub.subtotal), 0);
        const fee = Math.round((gross * feePercent) / 100);
        const earliest = subOrders
            .map((sub) => new Date(sub.completed_at))
            .sort((a, b) => a.getTime() - b.getTime())[0];
        const payout = await marketplace.createPayouts({
            artisan_id: artisan.id,
            period_start: (0, format_1.vnWeekStart)(earliest),
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
        });
        await marketplace.updateSubOrders(subOrders.map((sub) => ({ id: sub.id, payout_id: payout.id })));
        created.push(payout);
    }
    return created;
}
async function markPayoutPaid(container, payoutId, transactionRef) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const payout = await marketplace.retrievePayout(payoutId, {
        relations: ["artisan"],
    });
    if (payout.status === "paid") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Kỳ này đã được đánh dấu chuyển tiền");
    }
    const updated = await marketplace.updatePayouts({
        id: payout.id,
        status: "paid",
        paid_at: new Date(),
        transaction_ref: transactionRef,
    });
    await (0, notify_1.sendEmail)(container, payout.artisan.email, `Yarnly đã chuyển ${(0, format_1.formatVnd)(payout.net_amount)} cho bạn`, (0, notify_1.paragraph)(`Yarnly đã chuyển <b>${(0, format_1.formatVnd)(payout.net_amount)}</b> cho ${payout.sub_order_count} đơn hoàn thành từ ${(0, format_1.formatDate)(payout.period_start)} đến trước ${(0, format_1.formatDate)(payout.period_end)}.`) +
        (0, notify_1.paragraph)(`Tổng tiền hàng: ${(0, format_1.formatVnd)(payout.gross_amount)} – phí sàn ${payout.fee_percent}%: ${(0, format_1.formatVnd)(payout.fee_amount)}<br/>Tài khoản nhận: ${payout.bank_name} ${payout.bank_account_number}<br/>Mã giao dịch: ${transactionRef}`));
    return updated;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5b3V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvbWFya2V0cGxhY2UvcGF5b3V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLDBDQTREQztBQUVELHdDQXNDQztBQWhIRCxxREFBdUQ7QUFDdkQsMkRBQThEO0FBRTlELHFDQUE2RDtBQUM3RCxxQ0FBK0M7QUFDL0MsdUNBQW9DO0FBRXBDOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsZUFBZSxDQUNuQyxTQUEwQixFQUMxQixHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUU7SUFFaEIsTUFBTSxXQUFXLEdBQ2YsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFBO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQVcsRUFBQyxHQUFHLENBQUMsQ0FBQTtJQUMvQixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNoRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFBO0lBRTdELE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FDNUM7UUFDRSxNQUFNLEVBQUUsV0FBVztRQUNuQixTQUFTLEVBQUUsSUFBSTtRQUNmLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7S0FDOUIsRUFDRCxFQUFFLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQzNCLENBQUE7SUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQTtJQUVsRCxLQUFLLE1BQU0sUUFBUSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDckQsSUFBSSxDQUFDLElB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