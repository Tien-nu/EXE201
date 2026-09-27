import { getArtisanMe } from "@lib/data/artisan-portal"
import { ArtisanRegisterForm } from "@modules/artisan-portal/components/auth-forms"
import { redirect } from "next/navigation"

export default async function ArtisanRegisterPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  if (await getArtisanMe()) {
    redirect(`/${countryCode}/kenh-nghe-nhan`)
  }

  return (
    <div className="content-container flex justify-center py-12">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="txt-xlarge-plus mb-1">Đăng ký làm nghệ nhân</h1>
        <p className="txt-small text-ui-fg-subtle mb-6">
          Mở gian hàng đồ len handmade trên Yarnly. Admin sẽ duyệt đăng ký của bạn.
        </p>
        <ArtisanRegisterForm />
      </div>
    </div>
  )
}
