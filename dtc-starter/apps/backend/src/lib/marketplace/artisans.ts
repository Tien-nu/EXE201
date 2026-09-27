import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
} from "@medusajs/framework/http"
import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { STOREFRONT_URL } from "./constants"
import { escapeHtml, slugify } from "./format"
import { link, notifyAdmin, paragraph, sendEmail } from "./notify"

export type ArtisanProfileInput = {
  shop_name: string
  full_name: string
  email: string
  phone: string
  description?: string | null
  avatar_url?: string | null
  pickup_address: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
}

/** Fields returned to the artisan and the storefront; never the bank info publicly. */
export const PUBLIC_ARTISAN_FIELDS = [
  "id",
  "handle",
  "shop_name",
  "description",
  "avatar_url",
  "created_at",
] as const

const marketplaceService = (container: MedusaContainer): MarketplaceModuleService =>
  container.resolve(MARKETPLACE_MODULE)

/**
 * The artisan behind the request's token. Pending, rejected and locked
 * artisans may only read their own account unless `requireActive` is false.
 */
export async function getAuthedArtisan(
  req: AuthenticatedMedusaRequest | MedusaRequest,
  { requireActive = true } = {}
) {
  const artisanId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id

  if (!artisanId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Bạn cần đăng nhập bằng tài khoản nghệ nhân"
    )
  }

  const artisan = await marketplaceService(req.scope).retrieveArtisan(artisanId)

  if (requireActive && artisan.status !== "active") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      artisan.status === "pending"
        ? "Tài khoản đang chờ Admin duyệt"
        : "Tài khoản nghệ nhân đã bị từ chối hoặc khoá"
    )
  }

  return artisan
}

async function uniqueHandle(container: MedusaContainer, shopName: string) {
  const base = slugify(shopName) || "nghe-nhan"
  const marketplace = marketplaceService(container)

  for (let attempt = 0; attempt < 20; attempt++) {
    const handle = attempt ? `${base}-${attempt + 1}` : base
    const [taken] = await marketplace.listArtisans({ handle }, { take: 1 })

    if (!taken) {
      return handle
    }
  }

  return `${base}-${Date.now()}`
}

async function linkAuthIdentity(
  container: MedusaContainer,
  authIdentityId: string,
  artisanId: string
) {
  const auth = container.resolve(Modules.AUTH)
  const identity = await auth.retrieveAuthIdentity(authIdentityId)

  await auth.updateAuthIdentities({
    id: authIdentityId,
    app_metadata: { ...(identity.app_metadata ?? {}), artisan_id: artisanId },
  })
}

/** Self sign-up: the artisan registered an auth identity and waits for approval. */
export async function registerArtisan(
  container: MedusaContainer,
  authIdentityId: string,
  profile: ArtisanProfileInput
) {
  const marketplace = marketplaceService(container)
  const [existing] = await marketplace.listArtisans({ email: profile.email })

  if (existing) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      "Email này đã đăng ký gian hàng"
    )
  }

  const artisan = await marketplace.createArtisans({
    ...profile,
    handle: await uniqueHandle(container, profile.shop_name),
    status: "pending",
  })

  await linkAuthIdentity(container, authIdentityId, artisan.id)

  await notifyAdmin(
    container,
    `Nghệ nhân mới đăng ký: ${profile.shop_name}`,
    paragraph(
      `${escapeHtml(profile.full_name)} (${escapeHtml(profile.email)}, ${escapeHtml(profile.phone)}) vừa đăng ký gian hàng <b>${escapeHtml(profile.shop_name)}</b>. Vào Admin → Nghệ nhân để duyệt.`
    )
  )

  return artisan
}

/** An admin opens a shop directly; it is active right away. */
export async function createArtisanByAdmin(
  container: MedusaContainer,
  input: ArtisanProfileInput & { password: string }
) {
  const { password, ...profile } = input
  const marketplace = marketplaceService(container)
  const auth = container.resolve(Modules.AUTH)

  const [existing] = await marketplace.listArtisans({ email: profile.email })

  if (existing) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      "Email này đã có gian hàng"
    )
  }

  const { success, authIdentity, error } = await auth.register("emailpass", {
    body: { email: profile.email, password },
  } as any)

  if (!success || !authIdentity) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      error?.includes("exists")
        ? "Email này đã có tài khoản trên Yarnly. Hãy để nghệ nhân tự đăng ký bằng email đó."
        : error || "Không tạo được tài khoản đăng nhập"
    )
  }

  const artisan = await marketplace.createArtisans({
    ...profile,
    handle: await uniqueHandle(container, profile.shop_name),
    status: "active",
  })

  await linkAuthIdentity(container, authIdentity.id, artisan.id)

  await sendEmail(
    container,
    profile.email,
    "Yarnly đã tạo gian hàng cho bạn",
    paragraph(
      `Gian hàng <b>${escapeHtml(profile.shop_name)}</b> của bạn đã được tạo. Đăng nhập Kênh nghệ nhân bằng email ${escapeHtml(profile.email)} và mật khẩu Admin đã gửi cho bạn.`
    ) + link(`${STOREFRONT_URL}/kenh-nghe-nhan/dang-nhap`, "Đăng nhập Kênh nghệ nhân")
  )

  return artisan
}

async function setProductsVisible(
  container: MedusaContainer,
  artisanId: string,
  visible: boolean
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [artisan],
  } = await query.graph({
    entity: "artisan",
    fields: ["products.id", "products.status", "products.metadata"],
    filters: { id: artisanId },
  })

  for (const product of (artisan?.products ?? []) as any[]) {
    const hiddenByLock = product.metadata?.hidden_by_lock === true

    if (!visible && product.status === "published") {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            status: "draft",
            metadata: { ...product.metadata, hidden_by_lock: true },
          },
        },
      })
    } else if (visible && hiddenByLock) {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            status: "published",
            metadata: { ...product.metadata, hidden_by_lock: false },
          },
        },
      })
    }
  }
}

const STATUS_EMAILS: Record<string, (reason?: string | null) => [string, string]> = {
  active: () => [
    "Gian hàng của bạn đã được duyệt",
    paragraph("Chúc mừng! Bạn đã có thể đăng sản phẩm và nhận đơn trên Yarnly.") +
      link(`${STOREFRONT_URL}/kenh-nghe-nhan`, "Vào Kênh nghệ nhân"),
  ],
  rejected: (reason) => [
    "Đăng ký gian hàng chưa được duyệt",
    paragraph(`Lý do: ${escapeHtml(reason || "không có")}`),
  ],
  locked: (reason) => [
    "Gian hàng của bạn đã bị khoá",
    paragraph(
      `Lý do: ${escapeHtml(reason || "không có")}. Sản phẩm của bạn tạm thời bị ẩn khỏi sàn.`
    ),
  ],
}

/** approve / reject / lock / unlock from the admin. */
export async function setArtisanStatus(
  container: MedusaContainer,
  artisanId: string,
  status: "active" | "rejected" | "locked",
  reason?: string | null
) {
  const marketplace = marketplaceService(container)
  const artisan = await marketplace.retrieveArtisan(artisanId)

  const updated = await marketplace.updateArtisans({
    id: artisan.id,
    status,
    status_reason: status === "active" ? null : reason ?? null,
  })

  if (status === "locked") {
    await setProductsVisible(container, artisan.id, false)
  } else if (status === "active" && artisan.status === "locked") {
    await setProductsVisible(container, artisan.id, true)
  }

  const [subject, body] = STATUS_EMAILS[status](reason)
  await sendEmail(container, artisan.email, subject, body)

  return updated
}
