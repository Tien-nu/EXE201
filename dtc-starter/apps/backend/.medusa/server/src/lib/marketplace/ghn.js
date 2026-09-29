"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHN_STATUS_LABELS = exports.cancelGhnOrder = exports.createGhnOrder = exports.previewGhnOrder = exports.listWards = exports.listDistricts = exports.listProvinces = exports.ghnTrackingUrl = exports.isGhnConfigured = void 0;
exports.ghnRequest = ghnRequest;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Thin client for the GHN (Giao Hàng Nhanh) public API.
 * GHN_API_URL may end in /v2 (older .env files); both forms work.
 * Production host: https://online-gateway.ghn.vn — every created order is a
 * real pickup. Use https://dev-online-gateway.ghn.vn for testing.
 */
const BASE_URL = (process.env.GHN_API_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api")
    .replace(/\/+$/, "")
    .replace(/\/v2$/, "");
const TOKEN = process.env.GHN_API_TOKEN ?? "";
const SHOP_ID = process.env.GHN_SHOP_ID ?? "";
const isGhnConfigured = () => Boolean(TOKEN && SHOP_ID);
exports.isGhnConfigured = isGhnConfigured;
const ghnTrackingUrl = (orderCode) => `https://donhang.ghn.vn/?order_code=${encodeURIComponent(orderCode)}`;
exports.ghnTrackingUrl = ghnTrackingUrl;
async function ghnRequest(path, { method = "POST", body, withShop = true } = {}) {
    if (!TOKEN) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Chưa cấu hình GHN_API_TOKEN");
    }
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Token: TOKEN,
            ...(withShop && SHOP_ID ? { ShopId: String(SHOP_ID) } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result || result.code !== 200) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `GHN: ${result?.message ?? response.statusText}`);
    }
    return result.data;
}
// ---- Master data (provinces / districts / wards) --------------------------
// Administrative units almost never change, and checkout should not break
// (or wait) because GHN is slow: keep them in memory for 12 hours and fall
// back to the last copy when GHN cannot be reached.
const MASTER_DATA_TTL = 12 * 60 * 60 * 1000;
const masterData = new Map();
async function cachedMasterData(path) {
    const cached = masterData.get(path);
    if (cached && Date.now() - cached.at < MASTER_DATA_TTL) {
        return cached.data;
    }
    try {
        const data = await ghnRequest(path, { method: "GET", withShop: false });
        masterData.set(path, { at: Date.now(), data });
        return data;
    }
    catch {
        if (cached) {
            return cached.data;
        }
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, "Không tải được danh sách địa chỉ từ GHN, vui lòng thử lại sau ít phút");
    }
}
const listProvinces = () => cachedMasterData("/master-data/province");
exports.listProvinces = listProvinces;
const listDistricts = (provinceId) => cachedMasterData(`/master-data/district?province_id=${provinceId}`);
exports.listDistricts = listDistricts;
const listWards = (districtId) => cachedMasterData(`/master-data/ward?district_id=${districtId}`);
exports.listWards = listWards;
const toGhnPayload = (input) => {
    const weight = Math.max(input.items.reduce((sum, item) => sum + item.weight * item.quantity, 0), 100);
    return {
        // The receiver pays the shipping fee on delivery (agreed business rule).
        payment_type_id: 2,
        required_note: "CHOXEMHANGKHONGTHU",
        service_type_id: 2,
        client_order_code: input.client_order_code,
        from_name: input.from.name,
        from_phone: input.from.phone,
        from_address: input.from.address,
        from_ward_name: input.from.ward_name,
        from_district_name: input.from.district_name,
        from_province_name: input.from.province_name,
        to_name: input.to.name,
        to_phone: input.to.phone,
        to_address: input.to.address,
        to_ward_code: input.to.ward_code,
        to_district_id: input.to.district_id,
        cod_amount: Math.round(input.cod_amount),
        // GHN insures up to 5,000,000₫.
        insurance_value: Math.min(Math.round(input.insurance_value), 5_000_000),
        content: input.content.slice(0, 2000),
        weight,
        length: 20,
        width: 20,
        height: 10,
        items: input.items.map((item) => ({
            name: item.name.slice(0, 200),
            quantity: item.quantity,
            price: Math.round(item.price),
            weight: item.weight,
        })),
    };
};
/** Validates the order and quotes the fee without creating anything at GHN. */
const previewGhnOrder = (input) => ghnRequest("/v2/shipping-order/preview", { body: toGhnPayload(input) });
exports.previewGhnOrder = previewGhnOrder;
/** Creates a real shipping order: GHN sends a shipper to the pickup address. */
const createGhnOrder = (input) => ghnRequest("/v2/shipping-order/create", { body: toGhnPayload(input) });
exports.createGhnOrder = createGhnOrder;
const cancelGhnOrder = (orderCode) => ghnRequest("/v2/switch-status/cancel", { body: { order_codes: [orderCode] } });
exports.cancelGhnOrder = cancelGhnOrder;
// ---- Webhook statuses -------------------------------------------------------
/**
 * GHN status -> what it means for a sub-order:
 * - delivered: the customer got it
 * - returned: it came back to the artisan, the sub-order is canceled
 * - cancel: the shipping order was canceled at GHN, a new one can be created
 * - anything else: still on its way, only recorded
 */
exports.GHN_STATUS_LABELS = {
    ready_to_pick: "Chờ lấy hàng",
    picking: "Đang lấy hàng",
    money_collect_picking: "Đang lấy hàng",
    picked: "Đã lấy hàng",
    storing: "Đang lưu kho",
    transporting: "Đang luân chuyển",
    sorting: "Đang phân loại",
    delivering: "Đang giao",
    money_collect_delivering: "Đang giao",
    delivered: "Đã giao",
    delivery_fail: "Giao thất bại",
    waiting_to_return: "Chờ trả hàng",
    return: "Đang trả hàng",
    return_transporting: "Đang trả hàng",
    return_sorting: "Đang trả hàng",
    returning: "Đang trả hàng",
    return_fail: "Trả hàng thất bại",
    returned: "Đã trả hàng về nghệ nhân",
    cancel: "Vận đơn đã huỷ",
    exception: "Có sự cố",
    damage: "Hàng bị hư hỏng",
    lost: "Hàng bị thất lạc",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2huLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9naG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBd0JBLGdDQTJCQztBQW5ERCxxREFBdUQ7QUFFdkQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFFBQVEsR0FBRyxDQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLG9EQUFvRCxDQUNoRjtLQUNFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0tBQ25CLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFFdkIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFBO0FBQzdDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQTtBQUV0QyxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxDQUFBO0FBQWpELFFBQUEsZUFBZSxtQkFBa0M7QUFFdkQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FDbEQsc0NBQXNDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUE7QUFEMUQsUUFBQSxjQUFjLGtCQUM0QztBQUloRSxLQUFLLFVBQVUsVUFBVSxDQUM5QixJQUFZLEVBQ1osRUFBRSxNQUFNLEdBQUcsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsSUFBSSxLQUFzRSxFQUFFO0lBRWhILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSw2QkFBNkIsQ0FBQyxDQUFBO0lBQ3RGLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLFFBQVEsR0FB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