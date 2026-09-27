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
import {
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
  refund_status: string
  cancel_reason: string | null
  shipping_name: string | null
  shipping_phone: string | null
  shipping_address: string | null
  created_at: string
  items: { id: string; title: string; variant_title: string | null; quantity: number }[]
  artisan: { shop_name: string; phone: string; pickup_address: string }
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
                    onClick={() => {
                      const reason = window.prompt(
                        "Huỷ đơn vì không nhận được tiền? Ghi chú (tuỳ chọn):",
                        "Yarnly không nhận được tiền chuyển khoản"
                      )
                      if (reason !== null) {
                        action.mutate({
                          path: `/orders/${order.id}/reject-payment`,
                          body: { reason },
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
  )
}

// ---- Sub-order lists -----------------------------------------------------

const useSubOrders = (query: string) =>
  useQuery({
    queryKey: ["mp-orders", "sub-orders", query],
    queryFn: () => api<{ sub_orders: SubOrder[] }>(`/sub-orders?${query}`),
    refetchInterval: 30000,
  })

const ReadyToShipTab = () => {
  const action = useAction()
  const { data, isLoading } = useSubOrders("status=ready_to_ship")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Không có đơn nào chờ tạo vận đơn.</Empty>

  return (
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
                {sub.artisan.pickup_address}
              </Text>
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
              <Button
                size="small"
                onClick={() => {
                  const carrier = window.prompt("Đơn vị vận chuyển (VD: GHN, GHTK, Viettel Post):")
                  if (!carrier) return
                  const tracking = window.prompt("Mã vận đơn:")
                  if (!tracking) return
                  action.mutate({
                    path: `/sub-orders/${sub.id}/ship`,
                    body: { carrier, tracking_number: tracking },
                  })
                }}
              >
                Nhập vận đơn
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const ShippingTab = () => {
  const action = useAction()
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
              {sub.carrier} – {sub.tracking_number}
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
              <Button
                size="small"
                onClick={() => action.mutate({ path: `/sub-orders/${sub.id}/deliver` })}
              >
                Đã giao
              </Button>
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
  const { data, isLoading } = useSubOrders("")

  if (isLoading) return <Empty>Đang tải…</Empty>
  if (!data?.sub_orders.length) return <Empty>Chưa có đơn nào.</Empty>

  return (
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
                    onClick={() => {
                      const reason = window.prompt(`Lý do huỷ đơn ${sub.code}?`)
                      if (reason) {
                        action.mutate({
                          path: `/sub-orders/${sub.id}/cancel`,
                          body: { reason },
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
