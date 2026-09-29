# Yarnly – sàn đồ len handmade (EXE201)

Sàn trung gian giữa khách và nghệ nhân làm đồ len, xây trên Medusa v2 (backend + trang Admin) và Next.js (storefront).

## Vai trò

| Vai trò | Ở đâu | Làm được gì |
|---|---|---|
| Guest | `http://localhost:8000/vn` | Xem, tìm sản phẩm, xem gian hàng, thêm giỏ. Không thanh toán được – phải đăng nhập. |
| User | như trên | Đặt hàng COD / chuyển khoản (VietQR, 10 phút), theo dõi đơn con, huỷ khi nghệ nhân chưa nhận, gửi yêu cầu làm riêng. |
| Nghệ nhân | `http://localhost:8000/vn/kenh-nghe-nhan` | Đăng ký (chờ duyệt), quản lý sản phẩm (có sẵn / làm theo đơn), nhận – từ chối đơn trong 12 giờ, báo "Đã làm xong", báo giá làm riêng, xem thu nhập. |
| Admin | `http://localhost:9000/app` → **Nghệ nhân / Đơn sàn / Đối soát** | Duyệt / tạo / khoá nghệ nhân, xác nhận chuyển khoản, nhập vận đơn, đánh dấu đã giao, hoàn tiền, chuyển tiền thứ Hai, phí sàn. |

Tự động mỗi phút: huỷ đơn chuyển khoản quá 10 phút, huỷ đơn nghệ nhân không nhận trong 12 giờ, hoàn thành đơn 2 ngày sau khi giao. Thứ Hai 7:00 tạo sẵn các khoản cần chuyển cho nghệ nhân.

Code chính: `apps/backend/src/modules/marketplace` (bảng dữ liệu), `apps/backend/src/lib/marketplace` (nghiệp vụ), `apps/backend/src/api/{store,artisan,admin}` (API), `apps/backend/src/admin/routes` (trang Admin), `apps/storefront/src/app/[countryCode]/(artisan)` (Kênh nghệ nhân).

## Chạy dự án

```bash
npm install -g pnpm@10.11.1   # một lần
cd dtc-starter
pnpm install
cp apps/backend/.env.template apps/backend/.env            # điền DATABASE_URL
cp apps/storefront/.env.template apps/storefront/.env.local  # điền NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
pnpm dev                      # backend :9000 + storefront :8000 (khi đang sửa code)
pnpm demo                     # storefront chế độ production: bấm chuyển trang nhanh (khi demo/dùng thử)
```

`pnpm dev` biên dịch từng trang ở lần mở đầu tiên (có trang mất 5–10 giây) và không tải trước trang khi rê chuột qua link. `pnpm demo` build storefront một lần (khoảng 1 phút) rồi chạy bản production: trang mở trong khoảng 0,1–0,5 giây. Sửa code storefront xong thì phải chạy lại `pnpm demo`.

Database mới (chạy một lần trong `apps/backend`):

```bash
pnpm medusa db:migrate
pnpm medusa exec ./src/scripts/setup-marketplace.ts   # gian hàng mặc định, phí ship 0đ (trả khi nhận)
pnpm medusa user -e admin@example.com -p <mật-khẩu>    # tài khoản Admin
```

Email thật: điền `SMTP_USER` / `SMTP_PASS` (Gmail App password) trong `apps/backend/.env` và Gmail Admin ở trang **Đối soát**. Không điền thì email chỉ được ghi ra log.

Các script `.js` cũ trong `apps/backend` đọc `DATABASE_URL` từ môi trường: `node --env-file=.env <tên-script>.js`.

## Deploy

Backend + Admin chạy trên Render (`https://exe201-c6xo.onrender.com`, cấu hình trong [`render.yaml`](../render.yaml)), storefront trên Vercel, database và ảnh trên Supabase. Máy ở nhà và bản deploy **dùng chung một database**.

- **Sửa trang Admin** (`apps/backend/src/admin`): chạy `pnpm build:admin` trong `apps/backend` rồi commit thư mục `admin-build/`. Render không đủ RAM để tự build trang Admin nên dùng bản build sẵn này.
- **Thêm/sửa bảng dữ liệu**: chạy `pnpm medusa db:migrate` ở máy (database dùng chung) trước khi push. Server không tự migrate khi khởi động.
- **Không** chạy script xoá/seed sản phẩm trong lệnh start: Render free khởi động lại mỗi lần "thức dậy", dữ liệu sẽ bị xoá liên tục.
- Storefront lấy URL backend và publishable key từ `apps/storefront/.env.production` (giá trị công khai). Biến đặt trên Vercel được ưu tiên hơn file này.
- Render free ngủ sau 15 phút không có truy cập (các job tự động mỗi phút sẽ dừng theo). Dùng UptimeRobot hoặc cron-job.org gọi `https://exe201-c6xo.onrender.com/health` mỗi 10 phút để giữ server chạy.
- Ảnh cũ còn link `localhost`: điền `S3_*` vào `apps/backend/.env` rồi chạy `pnpm medusa exec ./src/scripts/fix-image-urls.ts` một lần.

---

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa DTC Starter
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/develop/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Medusa is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/medusajs/medusa">
    <img src="https://circleci.com/gh/medusajs/medusa.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://github.com/medusajs/medusa/blob/develop/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

# Medusa DTC Starter

A production-ready monorepo starter for direct-to-consumer ecommerce stores powered by Medusa and Next.js. Includes a fully featured storefront with product browsing, cart, checkout, customer accounts, and order management.

## Features

- All of [Medusa's commerce features](https://docs.medusajs.com/resources/commerce-modules)
- Multi-region support with automatic country detection
- Product catalog with variant selection
- Cart with promotion codes
- Multi-step checkout with shipping and payment
- Customer accounts with order history and address management
- Order transfer between accounts

## Getting Started

### Deploy with Medusa Cloud

The fastest way to get started is deploying with [Medusa Cloud](https://cloud.medusajs.com):

1. [Create a Medusa Cloud account](https://cloud.medusajs.com)
2. Deploy this starter directly from your dashboard

### Local Installation

> **Prerequisites:
>
> - [Node.js](https://nodejs.org/) v20+
> - [PostgreSQL](https://www.postgresql.org/) v15+
> - [pnpm](https://pnpm.io/) v10+

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/medusajs/dtc-starter.git
cd dtc-starter
pnpm install
```

2. Set up environment variables for the backend:

```bash
cp apps/backend/.env.template apps/backend/.env
```

3. Set the database URL in `apps/backend.env`:

```bash
# Replace with actual database URL, make sure the database exists.
DATABASE_URL=postgres://postgres:@localhost:5432/medusa-dtc-starter
```

4. Run migrations:

```bash
cd apps/backend
pnpm medusa db:migrate
```

5. Add admin user:

```bash
cd apps/backend
pnpm medusa user -e admin@test.com -p supersecret
```

6. Start Medusa backend:

```bash
cd apps/backend
pnpm dev
```

7. Open the admin dashboard at `localhost:9000/app` and log in. Retrieve your publishable API key at Settings > Publishable API key.

8. Set up environment variables for the storefront:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

9. Update `apps/storefront/.env.local` with your Medusa publishable API key:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_6c3...
```

10.  Start storefront:

```bash
cd apps/storefront
pnpm dev
```

The storefront runs on `http://localhost:8000`.

You can slo run the following command from the root to start both backend and storefront:

```bash
pnpm dev
```

## Configuration

The storefront is configured via environment variables in `apps/storefront/.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from your Medusa backend | — |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL of your Medusa backend | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region country code | `dk` |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the storefront | `https://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key (optional) | — |

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
