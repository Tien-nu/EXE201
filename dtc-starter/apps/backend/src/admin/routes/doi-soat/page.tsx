import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  StatusBadge,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { api, formatDate, formatVnd } from "../../lib/marketplace"

type Payout = {
  id: string
  period_start: string
  period_end: string
  sub_order_count: number
  gross_amount: number
  fee_percent: number
  fee_amount: number
  net_amount: number
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  status: "pending" | "paid"
  transaction_ref: string | null
  paid_at: string | null
  artisan: { shop_name: string; email: string }
}

const PayoutsSection = () => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["mp-payouts"],
    queryFn: () => api<{ payouts: Payout[] }>("/payouts"),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["mp-payouts"] })

  const generate = useMutation({
    mutationFn: () => api<{ created: number }>("/payouts", { method: "POST", body: {} }),
    onSuccess: ({ created }) => {
      toast.success(
        created ? `Đã tạo ${created} khoản cần chuyển` : "Không có đơn hoàn thành nào mới"
      )
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const markPaid = useMutation({
    mutationFn: ({ id, transaction_ref }: { id: string; transaction_ref: string }) =>
      api(`/payouts/${id}/paid`, { method: "POST", body: { transaction_ref } }),
    onSuccess: () => {
      toast.success("Đã đánh dấu đã chuyển")
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Chuyển tiền cho nghệ nhân</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Mỗi thứ Hai hệ thống tự tổng hợp các đơn hoàn thành tuần trước. Chuyển khoản rồi
            bấm "Đã chuyển".
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          isLoading={generate.isPending}
          onClick={() => generate.mutate()}
        >
          Tổng hợp tuần trước
        </Button>
      </div>
      {isLoading ? (
        <Text className="p-6">Đang tải…</Text>
      ) : !data?.payouts.length ? (
        <Text className="p-6 text-ui-fg-subtle">Chưa có kỳ chuyển tiền nào.</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nghệ nhân</Table.HeaderCell>
              <Table.HeaderCell>Kỳ</Table.HeaderCell>
              <Table.HeaderCell>Số đơn</Table.HeaderCell>
              <Table.HeaderCell>Tiền hàng</Table.HeaderCell>
              <Table.HeaderCell>Phí sàn</Table.HeaderCell>
              <Table.HeaderCell>Cần chuyển</Table.HeaderCell>
              <Table.HeaderCell>Tài khoản</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.payouts.map((payout) => (
              <Table.Row key={payout.id}>
                <Table.Cell>{payout.artisan.shop_name}</Table.Cell>
                <Table.Cell>
                  {formatDate(payout.period_start)} – {formatDate(payout.period_end)}
                </Table.Cell>
                <Table.Cell>{payout.sub_order_count}</Table.Cell>
                <Table.Cell>{formatVnd(payout.gross_amount)}</Table.Cell>
                <Table.Cell>
                  {payout.fee_percent}% ({formatVnd(payout.fee_amount)})
                </Table.Cell>
                <Table.Cell>
                  <Text weight="plus">{formatVnd(payout.net_amount)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">
                    {payout.bank_name} – {payout.bank_account_number}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {payout.bank_account_name}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {payout.status === "paid" ? (
                    <div>
                      <StatusBadge color="green">Đã chuyển</StatusBadge>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {payout.transaction_ref}
                      </Text>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => {
                        const ref = window.prompt("Mã giao dịch chuyển khoản:")
                        if (ref) {
                          markPaid.mutate({ id: payout.id, transaction_ref: ref })
                        }
                      }}
                    >
                      Đã chuyển
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

const SETTINGS_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "platform_fee_percent", label: "Phí sàn (%)", hint: "Hiện tại 0%. Áp dụng cho các kỳ chuyển tiền tạo sau khi đổi." },
  { key: "admin_email", label: "Gmail nhận thông báo Admin", hint: "Nhận email khi nghệ nhân làm xong, khách báo đã chuyển khoản…" },
  { key: "bank_name", label: "Ngân hàng nhận tiền của Yarnly" },
  { key: "bank_code", label: "Mã ngân hàng VietQR", hint: "VD: mb, vcb, tcb, acb hoặc mã BIN" },
  { key: "bank_account_number", label: "Số tài khoản" },
  { key: "bank_account_name", label: "Chủ tài khoản" },
]

const SettingsSection = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Record<string, string>>({})
  const { data } = useQuery({
    queryKey: ["mp-settings"],
    queryFn: () => api<{ settings: Record<string, unknown> }>("/settings"),
  })

  useEffect(() => {
    if (data?.settings) {
      setForm(
        Object.fromEntries(
          SETTINGS_FIELDS.map(({ key }) => [key, String(data.settings[key] ?? "")])
        )
      )
    }
  }, [data])

  const save = useMutation({
    mutationFn: () => api("/settings", { method: "POST", body: form }),
    onSuccess: () => {
      toast.success("Đã lưu cài đặt")
      queryClient.invalidateQueries({ queryKey: ["mp-settings"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Container className="flex flex-col gap-y-4 px-6 py-4">
      <div>
        <Heading>Cài đặt sàn</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Tài khoản ngân hàng dùng để tạo mã VietQR khi khách chuyển khoản.
        </Text>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SETTINGS_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-y-1">
            <Label size="small">{field.label}</Label>
            <Input
              value={form[field.key] ?? ""}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, [field.key]: event.target.value }))
              }
            />
            {field.hint && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {field.hint}
              </Text>
            )}
          </div>
        ))}
      </div>
      <div>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          Lưu
        </Button>
      </div>
    </Container>
  )
}

const PayoutsPage = () => (
  <div className="flex flex-col gap-y-3">
    <PayoutsSection />
    <SettingsSection />
  </div>
)

export const config = defineRouteConfig({
  label: "Đối soát",
  icon: CurrencyDollar,
})

export default PayoutsPage
