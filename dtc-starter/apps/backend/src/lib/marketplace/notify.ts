import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import type MarketplaceModuleService from "../../modules/marketplace/service"
import { escapeHtml } from "./format"

const layout = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
  <h2 style="color:#7c3aed;margin-bottom:4px">Yarnly</h2>
  <h3 style="margin-top:0">${escapeHtml(title)}</h3>
  ${body}
  <p style="color:#6b7280;font-size:12px;margin-top:32px">Email tự động từ sàn đồ len handmade Yarnly.</p>
</div>`

/** Sends one email; a failure is logged and never breaks the calling flow. */
export async function sendEmail(
  container: MedusaContainer,
  to: string | null | undefined,
  subject: string,
  body: string
) {
  if (!to) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const notification = container.resolve(Modules.NOTIFICATION)
    await notification.createNotifications({
      to,
      channel: "email",
      template: "yarnly",
      data: { subject, html: layout(subject, body) },
    })
  } catch (error) {
    logger.warn(
      `Could not send email "${subject}" to ${to}: ${(error as Error).message}`
    )
  }
}

/** Sends an email to the admin Gmail configured in the platform settings. */
export async function notifyAdmin(
  container: MedusaContainer,
  subject: string,
  body: string
) {
  const marketplace: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const settings = await marketplace.getSettings()
  const to = settings.admin_email || process.env.ADMIN_NOTIFY_EMAIL

  if (!to) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`Admin email "${subject}" skipped: set the admin Gmail in Admin → Đối soát`)
    return
  }

  await sendEmail(container, to, subject, body)
}

export const paragraph = (text: string) =>
  `<p style="line-height:1.5">${text}</p>`

export const link = (href: string, label: string) =>
  `<p><a href="${href}" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${escapeHtml(label)}</a></p>`
