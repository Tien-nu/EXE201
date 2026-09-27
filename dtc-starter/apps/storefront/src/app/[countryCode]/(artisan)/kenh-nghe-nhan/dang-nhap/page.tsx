import { getArtisanMe } from "@lib/data/artisan-portal"
import { ArtisanLoginForm } from "@modules/artisan-portal/components/auth-forms"
import { redirect } from "next/navigation"

export default async function ArtisanLoginPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  if (await getArtisanMe()) {
    redirect(`/${countryCode}/kenh-nghe-nhan`)
  }

  return (
    <div className="content-container flex justify-center py-16">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="txt-xlarge-plus mb-1">Đăng nhập Kênh nghệ nhân</h1>
        <p className="txt-small text-ui-fg-subtle mb-6">
          Quản lý sản phẩm, nhận đơn và theo dõi thu nhập.
        </p>
        <ArtisanLoginForm />
      </div>
    </div>
  )
}
