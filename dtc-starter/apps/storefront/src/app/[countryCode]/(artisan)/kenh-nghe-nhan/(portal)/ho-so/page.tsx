import { getArtisanMe } from "@lib/data/artisan-portal"
import ProfileForm from "@modules/artisan-portal/components/profile-form"
import { Card } from "@modules/artisan-portal/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function ArtisanProfilePage() {
  const artisan = await getArtisanMe()

  if (!artisan) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl-semi">Hồ sơ gian hàng</h1>
        <LocalizedClientLink
          href={`/nghe-nhan/${artisan.handle}`}
          className="txt-small text-violet-700 underline"
        >
          Xem gian hàng của bạn
        </LocalizedClientLink>
      </div>
      <Card>
        <ProfileForm artisan={artisan} />
      </Card>
    </div>
  )
}
