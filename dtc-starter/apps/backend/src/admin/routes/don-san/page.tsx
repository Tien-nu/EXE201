import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Table,
  Tabs,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useFormPrompt } from "../../lib/form-prompt"
import {
  GHN_STATUS,
  PAYMENT_STATUS,
  SUB_ORDER_STATUS,
  api,
  formatDate,
  formatDateTime,
  formatVnd,
} from "../../lib/marketplace"

type SubOrder = {
  id: string
  code: string
  status: string
  subtotal: number
  is_custom: boolean
  due_date: string | null
  accept_deadline: string | null
  carrier: string | null
  tracking_number: string | null
  carrier_status: string | null
  shipping_fee: number | null
  refund_status: string
  cancel_reason: string | null
  shipping_name: string | null
  shipping_phone: string | null
  shipping_address: string | null
  created_at: string
  items: { id: string; title: string; variant_title: string | null; quantity: number }[]
  artisan: {
    shop_name: string
    phone: string
    pickup_address: string
    pickup_ward_name: string | null
    pickup_district_name: string | null
    pickup_province_name: string | null
  }
  marketplace_order: { display_id: number; email: string; payment_method: string }
}

type MarketplaceOrder = {
  id: string
  display_id: number
  email: string
  items_total: number
  payment_status: string
  payment_deadline: string | null
  transfer_submitted_at: string | null
  created_at: string
  sub_orders: { id: string; code: string; status: string; subtotal: number }[]
}

const useRefresh = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["mp-orders"] })
}

const useAction = () => {
  const refresh = useRefresh()

  return useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown }) =>
      api(path, { method: "POST", body: body ?? {} }),
    onSuccess: () => {
      toast.success("Đã cập nhật")
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

const Empty = ({ children }: { children: string }) => (
  <Text className="p-6 text-ui-fg-subtle">{children}</Text>
)

const ItemsCell = ({ subOrder }: { subOrder: SubOrder }) => (
  <div className="flex flex-col py-2">
    {subOrder.items.map((item) => (
      <Text key={item.id} size="small">
        {item.quantity} × {item.title}
        {item.variant_title ? ` (${item.variant_title})` : ""}
      </Text>
    ))}
    {subOrder.is_custom && (
      <Text size="xsmall" className="text-ui-fg-interactive">
        Làm theo yêu cầu riêng
      </Text>
    )}
  </div>
)

// ---- Bank transfers ------------------------------------------------------

const TransfersTab = () => {
  const action = useAction()
  const prompt = usePrompt()
  const [dialog, ask] = useFormPrompt()
  const { data, isLoading } = useQuery({
    queryKey: ["mp-orders", "transfers"],
    queryFn: () =>
      api<{ orders: MarketplaceOrder[] }>(
        "/orders?payment_status=transfer_submitted&payment_status=awaiting_transfer"
      ),
    refetchInterval: 30000,
  })

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.orders.length) return <Empty>Không có đơn nào chờ xác nhận chuyển khoản.</Empty>

  return (
    <>
    {dialog}
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Đơn</Table.HeaderCell>
          <Table.HeaderCell>Khách</Table.HeaderCell>
          <Table.HeaderCell>Nội dung CK</Table.HeaderCell>
          <Table.HeaderCell>Số tiền</Table.HeaderCell>
          <Table.HeaderCell>Trạng thái</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.orders.map((order) => {
          const amount = order.sub_orders
            .filter((sub) => sub.status !== "canceled")
            .reduce((sum, sub) => sum + Number(sub.subtotal), 0)
          const status = PAYMENT_STATUS[order.payment_status]

          return (
            <Table.Row key={order.id}>
              <Table.Cell>
                #{order.display_id}
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {formatDateTime(order.created_at)}
                </Text>
              </Table.Cell>
              <Table.Cell>{order.email}</Table.Cell>
              <Table.Cell>
                <Text weight="plus">YARNLY {order.display_id}</Text>
              </Table.Cell>
              <Table.Cell>{formatVnd(amount)}</Table.Cell>
              <Table.Cell>
                <StatusBadge color={status.color}>{status.label}</StatusBadge>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {order.payment_status === "transfer_submitted"
                    ? `Báo lúc ${formatDateTime(order.transfer_submitted_at)}`
                    : `Hạn ${formatDateTime(order.payment_deadline)}`}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-x-2">
                  <Button
                    size="small"
                    onClick={async () => {
                      const confirmed = await prompt({
                        title: `Xác nhận đã nhận ${formatVnd(amount)}?`,
                        description: `Chỉ xác nhận khi sao kê có giao dịch nội dung "YARNLY ${order.display_id}".`,
                        confirmText: "Đã nhận tiền",
                        cancelText: "Huỷ",
                      })
                      if (confirmed) {
                        action.mutate({ path: `/orders/${order.id}/confirm-payment` })
                      }
                    }}
                  >
                    Đã nhận tiền
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={async () => {
                      const values = await ask({
                        title: `Huỷ đơn #${order.display_id} vì không nhận được tiền?`,
                        description: "Các đơn con đang chờ thanh toán sẽ bị huỷ và khách nhận email kèm lý do.",
                        fields: [
                          {
                            name: "reason",
                            label: "Lý do gửi khách",
                            defaultValue: "Yarnly không nhận được tiền chuyển khoản",
                            multiline: true,
                          },
                        ],
                        confirmText: "Huỷ đơn",
                        variant: "danger",
                      })
                      if (values) {
                        action.mutate({
                          path: `/orders/${order.id}/reject-payment`,
                          body: { reason: values.reason },
                        })
                      }
                    }}
                  >
                    Không nhận được
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
    </>
  )
}

// ---- Sub-order lists -----------------------------------------------------

const useSubOrders = (query: string) =>
  useQuery({
    queryKey: ["mp-orders", "sub-orders", query],
    queryFn: () => api<{ sub_orders: SubOrder[] }>(`/sub-orders?${query}`),
    refetchInterval: 30000,
  })

const useGhnEnabled = () =>
  useQuery({
    queryKey: ["mp-settings"],
    queryFn: () => api<{ ghn_enabled: boolean }>("/settings"),
  }).data?.ghn_enabled ?? false

type GhnQuote = {
  total_fee: number
  expected_delivery_time: string | null
  cod_amount: number
  from: { name: string; address: string; ward_name: string; district_name: string; province_name: string }
  to: { name: string; phone: string; address: string }
}

/** Quotes first, then books a real GHN pickup only after the admin confirms. */
const GhnButton = ({ subOrder }: { subOrder: SubOrder }) => {
  const refresh = useRefresh()
  const prompt = usePrompt()
  const [busy, setBusy] = useState(false)

  const book = async () => {
    setBusy(true)
    try {
      const { quote } = await api<{ quote: GhnQuote }>(`/sub-orders/${subOrder.id}/ghn-quote`, {
        method: "POST",
        body: {},
      })
      const confirmed = await prompt({
        title: `Tạo vận đơn GHN cho đơn ${subOrder.code}?`,
        description:
          `Lấy hàng: ${quote.from.name}, ${quote.from.address}, ${quote.from.ward_name}, ${quote.from.district_name}, ${quote.from.province_name}. ` +
          `Giao tới: ${quote.to.name} (${quote.to.phone}), ${quote.to.address}. ` +
          `Phí ship ${formatVnd(quote.total_fee)} (khách trả khi nhận)` +
          (quote.cod_amount ? `, thu hộ tiền hàng ${formatVnd(quote.cod_amount)}.` : ", không thu hộ (đã chuyển khoản).") +
          (quote.expected_delivery_time ? ` Dự kiến giao ${formatDate(quote.expected_delivery_time)}.` : ""),
        confirmText: "Đặt shipper GHN",
        cancelText: "Huỷ",
      })
      if (!confirmed) return
      const created = await api<{ order_code: string }>(`/sub-orders/${subOrder.id}/ghn`, {
        method: "POST",
        body: {},
      })
      toast.success(`Đã tạo vận đơn GHN ${created.order_code}`)
      refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button size="small" isLoading={busy} onClick={book}>
      Tạo vận đơn GHN
    </Button>
  )
}

const ReadyToShipTab = () => {
  const action = useAction()
  const [dialog, ask] = useFormPrompt()
  const ghnEnabled = useGhnEnabled()
  const { data, isLoading } = useSubOrders("status=ready_to_ship")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Không có đơn nào chờ tạo vận đơn.</Empty>

  return (
    <>
    {dialog}
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Đơn</Table.HeaderCell>
          <Table.HeaderCell>Lấy hàng tại</Table.HeaderCell>
          <Table.HeaderCell>Giao tới</Table.HeaderCell>
          <Table.HeaderCell>Hàng</Table.HeaderCell>
          <Table.HeaderCell>Thu hộ</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.sub_orders.map((sub) => (
          <Table.Row key={sub.id}>
            <Table.Cell>{sub.code}</Table.Cell>
            <Table.Cell>
              <Text size="small" weight="plus">
                {sub.artisan.shop_name} – {sub.artisan.phone}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {[sub.artisan.pickup_address, sub.artisan.pickup_ward_name, sub.artisan.pickup_district_name, sub.artisan.pickup_province_name]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {!sub.artisan.pickup_ward_name && (
                <Text size="xsmall" className="text-ui-fg-error">
                  Nghệ nhân chưa chọn Phường/Quận lấy hàng – chưa tạo được vận đơn GHN
                </Text>
              )}
            </Table.Cell>
            <Table.Cell>
              <Text size="small" weight="plus">
                {sub.shipping_name} – {sub.shipping_phone}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {sub.shipping_address}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <ItemsCell subOrder={sub} />
            </Table.Cell>
            <Table.Cell>
              {sub.marketplace_order.payment_method === "cod"
                ? `${formatVnd(sub.subtotal)} + ship`
                : "Chỉ phí ship"}
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-col gap-y-2">
                {ghnEnabled && <GhnButton subOrder={sub} />}
                <Button
                  size="small"
                  variant="secondary"
                  onClick={async () => {
                    const values = await ask({
                      title: `Nhập vận đơn cho đơn ${sub.code}`,
                      description: "Dùng khi gửi hàng qua đơn vị khác hoặc đã tạo vận đơn ngoài hệ thống.",
                      fields: [
                        { name: "carrier", label: "Đơn vị vận chuyển", placeholder: "VD: GHTK, Viettel Post", required: true },
                        { name: "tracking_number", label: "Mã vận đơn", required: true },
                      ],
                      confirmText: "Lưu vận đơn",
                    })
                    if (values) {
                      action.mutate({
                        path: `/sub-orders/${sub.id}/ship`,
                        body: { carrier: values.carrier, tracking_number: values.tracking_number },
                      })
                    }
                  }}
                >
                  Nhập tay
                </Button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
    </>
  )
}

const ShippingTab = () => {
  const action = useAction()
  const prompt = usePrompt()
  const { data, isLoading } = useSubOrders("status=shipping")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Không có đơn nào đang giao.</Empty>

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Đơn</Table.HeaderCell>
          <Table.HeaderCell>Vận đơn</Table.HeaderCell>
          <Table.HeaderCell>Giao tới</Table.HeaderCell>
          <Table.HeaderCell>Hàng</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.sub_orders.map((sub) => (
          <Table.Row key={sub.id}>
            <Table.Cell>{sub.code}</Table.Cell>
            <Table.Cell>
              <Text size="small">
                {sub.carrier} –{" "}
                {sub.carrier === "GHN" ? (
                  <a
                    href={`https://donhang.ghn.vn/?order_code=${sub.tracking_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui-fg-interactive underline"
                  >
                    {sub.tracking_number}
                  </a>
                ) : (
                  sub.tracking_number
                )}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {[
                  sub.carrier_status && (GHN_STATUS[sub.carrier_status] ?? sub.carrier_status),
                  sub.shipping_fee && `ship ${formatVnd(sub.shipping_fee)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="small">
                {sub.shipping_name} – {sub.shipping_phone}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <ItemsCell subOrder={sub} />
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-col gap-y-2">
                <Button
                  size="small"
                  onClick={() => action.mutate({ path: `/sub-orders/${sub.id}/deliver` })}
                >
                  Đã giao
                </Button>
                {sub.carrier === "GHN" && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={async () => {
                      const ok = await prompt({
                        title: `Huỷ vận đơn GHN ${sub.tracking_number}?`,
                        description: "Chỉ huỷ được khi shipper chưa lấy hàng. Đơn con sẽ quay về \"Chờ giao hàng\" để tạo vận đơn mới.",
                        confirmText: "Huỷ vận đơn",
                        cancelText: "Giữ lại",
                        variant: "danger",
                      })
                      if (ok) {
                        action.mutate({ path: `/sub-orders/${sub.id}/ghn-cancel` })
                      }
                    }}
                  >
                    Huỷ vận đơn GHN
                  </Button>
                )}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const RefundsTab = () => {
  const action = useAction()
  const { data, isLoading } = useSubOrders("refund_status=pending")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Không có khoản nào cần hoàn.</Empty>

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Đơn</Table.HeaderCell>
          <Table.HeaderCell>Khách</Table.HeaderCell>
          <Table.HeaderCell>Số tiền hoàn</Table.HeaderCell>
          <Table.HeaderCell>Lý do huỷ</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.sub_orders.map((sub) => (
          <Table.Row key={sub.id}>
            <Table.Cell>{sub.code}</Table.Cell>
            <Table.Cell>{sub.marketplace_order.email}</Table.Cell>
            <Table.Cell>{formatVnd(sub.subtotal)}</Table.Cell>
            <Table.Cell>{sub.cancel_reason}</Table.Cell>
            <Table.Cell>
              <Button
                size="small"
                onClick={() => action.mutate({ path: `/sub-orders/${sub.id}/refunded` })}
              >
                Đã hoàn tiền
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const AllSubOrdersTab = () => {
  const action = useAction()
  const [dialog, ask] = useFormPrompt()
  const { data, isLoading } = useSubOrders("")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Chưa có đơn nào.</Empty>

  return (
    <>
    {dialog}
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Đơn</Table.HeaderCell>
          <Table.HeaderCell>Nghệ nhân</Table.HeaderCell>
          <Table.HeaderCell>Hàng</Table.HeaderCell>
          <Table.HeaderCell>Tiền hàng</Table.HeaderCell>
          <Table.HeaderCell>Trạng thái</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.sub_orders.map((sub) => {
          const status = SUB_ORDER_STATUS[sub.status]
          const canCancel = !["completed", "canceled"].includes(sub.status)

          return (
            <Table.Row key={sub.id}>
              <Table.Cell>
                {sub.code}
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {formatDateTime(sub.created_at)} ·{" "}
                  {sub.marketplace_order.payment_method === "cod" ? "COD" : "CK"}
                </Text>
              </Table.Cell>
              <Table.Cell>{sub.artisan.shop_name}</Table.Cell>
              <Table.Cell>
                <ItemsCell subOrder={sub} />
              </Table.Cell>
              <Table.Cell>{formatVnd(sub.subtotal)}</Table.Cell>
              <Table.Cell>
                <StatusBadge color={status?.color ?? "grey"}>
                  {status?.label ?? sub.status}
                </StatusBadge>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {sub.status === "pending_acceptance" &&
                    `Hạn nhận ${formatDateTime(sub.accept_deadline)}`}
                  {sub.status === "processing" && sub.due_date &&
                    `Hạn làm xong ${formatDate(sub.due_date)}`}
                  {sub.status === "canceled" && sub.cancel_reason}
                </Text>
              </Table.Cell>
              <Table.Cell>
                {canCancel && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={async () => {
                      const values = await ask({
                        title: `Huỷ đơn ${sub.code}?`,
                        description: "Khách và nghệ nhân nhận email kèm lý do. Nếu khách đã chuyển khoản, đơn sẽ vào mục Cần hoàn tiền.",
                        fields: [{ name: "reason", label: "Lý do huỷ", multiline: true, required: true }],
                        confirmText: "Huỷ đơn",
                        variant: "danger",
                      })
                      if (values) {
                        action.mutate({
                          path: `/sub-orders/${sub.id}/cancel`,
                          body: { reason: values.reason },
                        })
                      }
                    }}
                  >
                    Huỷ
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
    </>
  )
}

const MarketplaceOrdersPage = () => (
  <Container className="p-0">
    <div className="px-6 py-4">
      <Heading>Đơn sàn</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Xác nhận chuyển khoản, tạo vận đơn khi nghệ nhân làm xong, hoàn tiền đơn huỷ.
      </Text>
    </div>
    <Tabs defaultValue="transfers">
      <Tabs.List className="px-6">
        <Tabs.Trigger value="transfers">Chờ xác nhận CK</Tabs.Trigger>
        <Tabs.Trigger value="ready">Chờ giao hàng</Tabs.Trigger>
        <Tabs.Trigger value="shipping">Đang giao</Tabs.Trigger>
        <Tabs.Trigger value="refunds">Cần hoàn tiền</Tabs.Trigger>
        <Tabs.Trigger value="all">Tất cả đơn con</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="transfers" className="pt-2">
        <TransfersTab />
      </Tabs.Content>
      <Tabs.Content value="ready" className="pt-2">
        <ReadyToShipTab />
      </Tabs.Content>
      <Tabs.Content value="shipping" className="pt-2">
        <ShippingTab />
      </Tabs.Content>
      <Tabs.Content value="refunds" className="pt-2">
        <RefundsTab />
      </Tabs.Content>
      <Tabs.Content value="all" className="pt-2">
        <AllSubOrdersTab />
      </Tabs.Content>
    </Tabs>
  </Container>
)

export const config = defineRouteConfig({
  label: "Đơn sàn",
  icon: ShoppingBag,
})

export default MarketplaceOrdersPage
