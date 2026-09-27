/** Calls the marketplace admin API with the dashboard's session cookie. */
export async function api<T = any>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown }
): Promise<T> {
  const response = await fetch(`/admin/marketplace${path}`, {
    method: init?.method ?? "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message ?? response.statusText)
  }

  return data as T
}

export const formatVnd = (amount: unknown) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(amount ?? 0))}₫`

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
    : "–"

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "–"

export const SUB_ORDER_STATUS: Record<
  string,
  { label: string; color: "grey" | "orange" | "blue" | "green" | "red" | "purple" }
> = {
  pending_payment: { label: "Chờ thanh toán", color: "grey" },
  pending_acceptance: { label: "Chờ nghệ nhân nhận", color: "orange" },
  processing: { label: "Đang làm / chuẩn bị", color: "blue" },
  ready_to_ship: { label: "Chờ giao hàng", color: "purple" },
  shipping: { label: "Đang giao", color: "blue" },
  delivered: { label: "Đã giao", color: "green" },
  completed: { label: "Hoàn thành", color: "green" },
  canceled: { label: "Đã huỷ", color: "red" },
}

export const PAYMENT_STATUS: Record<
  string,
  { label: string; color: "grey" | "orange" | "blue" | "green" | "red" | "purple" }
> = {
  cod: { label: "COD", color: "grey" },
  awaiting_transfer: { label: "Chờ khách chuyển", color: "orange" },
  transfer_submitted: { label: "Khách báo đã chuyển", color: "purple" },
  paid: { label: "Đã nhận tiền", color: "green" },
  expired: { label: "Quá hạn 10 phút", color: "red" },
  rejected: { label: "Không nhận được tiền", color: "red" },
}

export const ARTISAN_STATUS: Record<
  string,
  { label: string; color: "grey" | "orange" | "blue" | "green" | "red" | "purple" }
> = {
  pending: { label: "Chờ duyệt", color: "orange" },
  active: { label: "Hoạt động", color: "green" },
  rejected: { label: "Từ chối", color: "red" },
  locked: { label: "Bị khoá", color: "grey" },
}
