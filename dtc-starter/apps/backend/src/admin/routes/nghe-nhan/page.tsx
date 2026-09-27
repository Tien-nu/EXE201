import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  StatusBadge,
  Table,
  Tabs,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ARTISAN_STATUS, api, formatDate } from "../../lib/marketplace"

type Artisan = {
  id: string
  handle: string
  shop_name: string
  full_name: string
  email: string
  phone: string
  pickup_address: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  status: string
  status_reason: string | null
  created_at: string
}

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "shop_name", label: "Tên gian hàng" },
  { key: "full_name", label: "Họ tên nghệ nhân" },
  { key: "email", label: "Email đăng nhập", type: "email" },
  { key: "password", label: "Mật khẩu (tối thiểu 8 ký tự)", type: "password" },
  { key: "phone", label: "Số điện thoại" },
  { key: "pickup_address", label: "Địa chỉ lấy hàng" },
  { key: "bank_name", label: "Ngân hàng" },
  { key: "bank_account_number", label: "Số tài khoản" },
  { key: "bank_account_name", label: "Chủ tài khoản" },
  { key: "description", label: "Giới thiệu (tuỳ chọn)" },
]

const CreateArtisanDrawer = () => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: () => api("/artisans", { method: "POST", body: form }),
    onSuccess: () => {
      toast.success("Đã tạo gian hàng")
      setForm({})
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ["mp-artisans"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button size="small">Tạo nghệ nhân</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Tạo gian hàng cho nghệ nhân</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <Text size="small" className="text-ui-fg-subtle">
            Gian hàng được kích hoạt ngay. Hãy gửi email và mật khẩu cho nghệ nhân.
          </Text>
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-y-1">
              <Label size="small">{field.label}</Label>
              <Input
                type={field.type ?? "text"}
                value={form[field.key] ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, [field.key]: event.target.value }))
                }
              />
            </div>
          ))}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary" size="small">
              Huỷ
            </Button>
          </Drawer.Close>
          <Button size="small" isLoading={create.isPending} onClick={() => create.mutate()}>
            Tạo
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const ArtisanActions = ({ artisan }: { artisan: Artisan }) => {
  const queryClient = useQueryClient()
  const setStatus = useMutation({
    mutationFn: (body: { status: string; reason?: string | null }) =>
      api(`/artisans/${artisan.id}/status`, { method: "POST", body }),
    onSuccess: () => {
      toast.success("Đã cập nhật")
      queryClient.invalidateQueries({ queryKey: ["mp-artisans"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const withReason = (status: string, question: string) => {
    const reason = window.prompt(question)

    if (reason !== null) {
      setStatus.mutate({ status, reason })
    }
  }

  return (
    <div className="flex gap-x-2">
      {artisan.status === "pending" && (
        <>
          <Button size="small" onClick={() => setStatus.mutate({ status: "active" })}>
            Duyệt
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => withReason("rejected", "Lý do từ chối?")}
          >
            Từ chối
          </Button>
        </>
      )}
      {artisan.status === "active" && artisan.handle !== "yarnly" && (
        <Button
          size="small"
          variant="danger"
          onClick={() => withReason("locked", "Lý do khoá gian hàng?")}
        >
          Khoá
        </Button>
      )}
      {(artisan.status === "locked" || artisan.status === "rejected") && (
        <Button
          size="small"
          variant="secondary"
          onClick={() => setStatus.mutate({ status: "active" })}
        >
          {artisan.status === "locked" ? "Mở khoá" : "Duyệt lại"}
        </Button>
      )}
    </div>
  )
}

const ArtisanTable = ({ status }: { status?: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["mp-artisans", status ?? "all"],
    queryFn: () =>
      api<{ artisans: Artisan[] }>(`/artisans${status ? `?status=${status}` : ""}`),
  })

  if (isLoading) {
    return <Text className="p-6">Đang tải…</Text>
  }

  if (!data?.artisans.length) {
    return <Text className="p-6 text-ui-fg-subtle">Không có nghệ nhân nào.</Text>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Gian hàng</Table.HeaderCell>
          <Table.HeaderCell>Liên hệ</Table.HeaderCell>
          <Table.HeaderCell>Ngân hàng nhận tiền</Table.HeaderCell>
          <Table.HeaderCell>Trạng thái</Table.HeaderCell>
          <Table.HeaderCell>Ngày tạo</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.artisans.map((artisan) => {
          const status = ARTISAN_STATUS[artisan.status]

          return (
            <Table.Row key={artisan.id}>
              <Table.Cell>
                <div className="flex flex-col py-2">
                  <Text weight="plus">{artisan.shop_name}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {artisan.full_name}
                  </Text>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-col">
                  <Text size="small">{artisan.email}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {artisan.phone}
                  </Text>
                </div>
              </Table.Cell>
              <Table.Cell>
                <Text size="small">
                  {artisan.bank_name} – {artisan.bank_account_number}
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {artisan.bank_account_name}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge color={status?.color ?? "grey"}>
                  {status?.label ?? artisan.status}
                </StatusBadge>
                {artisan.status_reason && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {artisan.status_reason}
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>{formatDate(artisan.created_at)}</Table.Cell>
              <Table.Cell>
                <ArtisanActions artisan={artisan} />
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

const ArtisansPage = () => {
  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Nghệ nhân</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Duyệt đăng ký, tạo và khoá gian hàng.
          </Text>
        </div>
        <CreateArtisanDrawer />
      </div>
      <Tabs defaultValue="pending">
        <Tabs.List className="px-6">
          <Tabs.Trigger value="pending">Chờ duyệt</Tabs.Trigger>
          <Tabs.Trigger value="active">Hoạt động</Tabs.Trigger>
          <Tabs.Trigger value="locked">Bị khoá</Tabs.Trigger>
          <Tabs.Trigger value="rejected">Từ chối</Tabs.Trigger>
        </Tabs.List>
        {["pending", "active", "locked", "rejected"].map((status) => (
          <Tabs.Content key={status} value={status} className="pt-2">
            <ArtisanTable status={status} />
          </Tabs.Content>
        ))}
      </Tabs>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Nghệ nhân",
  icon: Users,
})

export default ArtisansPage
