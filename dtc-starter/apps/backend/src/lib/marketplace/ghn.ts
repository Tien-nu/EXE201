import { MedusaError } from "@medusajs/framework/utils"

/**
 * Thin client for the GHN (Giao Hàng Nhanh) public API.
 * GHN_API_URL may end in /v2 (older .env files); both forms work.
 * Production host: https://online-gateway.ghn.vn — every created order is a
 * real pickup. Use https://dev-online-gateway.ghn.vn for testing.
 */
const BASE_URL = (
  process.env.GHN_API_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api"
)
  .replace(/\/+$/, "")
  .replace(/\/v2$/, "")

const TOKEN = process.env.GHN_API_TOKEN ?? ""
const SHOP_ID = process.env.GHN_SHOP_ID ?? ""

export const isGhnConfigured = () => Boolean(TOKEN && SHOP_ID)

export const ghnTrackingUrl = (orderCode: string) =>
  `https://donhang.ghn.vn/?order_code=${encodeURIComponent(orderCode)}`

type GhnResponse<T> = { code: number; message: string; data: T }

export async function ghnRequest<T>(
  path: string,
  { method = "POST", body, withShop = true }: { method?: "GET" | "POST"; body?: unknown; withShop?: boolean } = {}
): Promise<T> {
  if (!TOKEN) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Chưa cấu hình GHN_API_TOKEN")
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Token: TOKEN,
      ...(withShop && SHOP_ID ? { ShopId: String(SHOP_ID) } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const result = (await response.json().catch(() => null)) as GhnResponse<T> | null

  if (!response.ok || !result || result.code !== 200) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `GHN: ${result?.message ?? response.statusText}`
    )
  }

  return result.data
}

// ---- Master data (provinces / districts / wards) --------------------------

// Administrative units almost never change, and checkout should not break
// (or wait) because GHN is slow: keep them in memory for 12 hours and fall
// back to the last copy when GHN cannot be reached.
const MASTER_DATA_TTL = 12 * 60 * 60 * 1000
const masterData = new Map<string, { at: number; data: unknown }>()

async function cachedMasterData<T>(path: string): Promise<T> {
  const cached = masterData.get(path)

  if (cached && Date.now() - cached.at < MASTER_DATA_TTL) {
    return cached.data as T
  }

  try {
    const data = await ghnRequest<T>(path, { method: "GET", withShop: false })
    masterData.set(path, { at: Date.now(), data })
    return data
  } catch {
    if (cached) {
      return cached.data as T
    }
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Không tải được danh sách địa chỉ từ GHN, vui lòng thử lại sau ít phút"
    )
  }
}

export const listProvinces = () =>
  cachedMasterData<{ ProvinceID: number; ProvinceName: string }[]>("/master-data/province")

export const listDistricts = (provinceId: number) =>
  cachedMasterData<{ DistrictID: number; DistrictName: string }[]>(
    `/master-data/district?province_id=${provinceId}`
  )

export const listWards = (districtId: number) =>
  cachedMasterData<{ WardCode: string; WardName: string }[]>(
    `/master-data/ward?district_id=${districtId}`
  )

// ---- Shipping orders --------------------------------------------------------

export type GhnOrderInput = {
  client_order_code: string
  from: {
    name: string
    phone: string
    address: string
    ward_name: string
    district_name: string
    province_name: string
  }
  to: {
    name: string
    phone: string
    address: string
    ward_code: string
    district_id: number
  }
  items: { name: string; quantity: number; price: number; weight: number }[]
  /** What the shipper collects for the goods (COD); 0 when already paid. */
  cod_amount: number
  insurance_value: number
  content: string
}

export type GhnOrderResult = {
  order_code: string
  total_fee: number
  expected_delivery_time?: string
}

const toGhnPayload = (input: GhnOrderInput) => {
  const weight = Math.max(
    input.items.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    100
  )

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
  }
}

/** Validates the order and quotes the fee without creating anything at GHN. */
export const previewGhnOrder = (input: GhnOrderInput) =>
  ghnRequest<GhnOrderResult>("/v2/shipping-order/preview", { body: toGhnPayload(input) })

/** Creates a real shipping order: GHN sends a shipper to the pickup address. */
export const createGhnOrder = (input: GhnOrderInput) =>
  ghnRequest<GhnOrderResult>("/v2/shipping-order/create", { body: toGhnPayload(input) })

export const cancelGhnOrder = (orderCode: string) =>
  ghnRequest<unknown>("/v2/switch-status/cancel", { body: { order_codes: [orderCode] } })

// ---- Webhook statuses -------------------------------------------------------

/**
 * GHN status -> what it means for a sub-order:
 * - delivered: the customer got it
 * - returned: it came back to the artisan, the sub-order is canceled
 * - cancel: the shipping order was canceled at GHN, a new one can be created
 * - anything else: still on its way, only recorded
 */
export const GHN_STATUS_LABELS: Record<string, string> = {
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
}
