import { listArtisans } from "@lib/data/marketplace"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nghệ nhân | Yarnly",
  description: "Các gian hàng đồ len handmade trên Yarnly.",
}

export default async function ArtisansPage() {
  const artisans = await listArtisans()

  return (
    <div className="content-container py-12">
      <h1 className="text-3xl-regular mb-2">Nghệ nhân trên Yarnly</h1>
      <p className="txt-medium text-ui-fg-subtle mb-8">
        Mỗi món đồ len được làm bởi một nghệ nhân thật. Chọn gian hàng để xem sản phẩm.
      </p>
      <ul className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-4">
        {artisans.map((artisan) => (
          <li key={artisan.id}>
            <LocalizedClientLink
              href={`/nghe-nhan/${artisan.handle}`}
              className="flex h-full flex-col gap-2 rounded-md border border-gray-200 p-5 hover:border-violet-300"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-xl text-violet-700">
                {artisan.shop_name.charAt(0)}
              </span>
              <span className="txt-medium-plus">{artisan.shop_name}</span>
              {artisan.description && (
                <span className="txt-small text-ui-fg-subtle line-clamp-3">
                  {artisan.description}
                </span>
              )}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
      <div className="mt-12 rounded-md bg-violet-50 p-6">
        <p className="txt-medium-plus">Bạn là người làm đồ len handmade?</p>
        <p className="txt-medium text-ui-fg-subtle mb-3">
          Mở gian hàng miễn phí trên Yarnly, nhận đơn và nhận tiền mỗi thứ Hai.
        </p>
        <LocalizedClientLink href="/kenh-nghe-nhan/dang-ky" className="text-violet-700 underline">
          Đăng ký làm nghệ nhân
        </LocalizedClientLink>
      </div>
    </div>
  )
}
