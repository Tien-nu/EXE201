import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import nodemailer, { type Transporter } from "nodemailer"

type Options = {
  host?: string
  port?: number
  user?: string
  pass?: string
  from?: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Sends emails through SMTP (e.g. Gmail with an app password). Without SMTP
 * credentials it only logs each email, so the flows still work in development.
 *
 * Callers render the email themselves and pass `{ subject, html }` as data.
 */
class EmailNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "yarnly-email"

  protected logger_: Logger
  protected options_: Options
  protected transporter_: Transporter | null

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.transporter_ =
      options.host && options.user && options.pass
        ? nodemailer.createTransport({
            host: options.host,
            port: options.port ?? 465,
            secure: (options.port ?? 465) === 465,
            auth: { user: options.user, pass: options.pass },
          })
        : null
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const data = (notification.data ?? {}) as { subject?: string; html?: string }
    const subject = data.subject ?? notification.template
    const html = data.html ?? ""

    if (!this.transporter_) {
      this.logger_.info(
        `[email:dev] to=${notification.to} subject="${subject}" (SMTP not configured, email not sent)`
      )
      return {}
    }

    const info = await this.transporter_.sendMail({
      from: this.options_.from ?? this.options_.user,
      to: notification.to,
      subject,
      html,
    })

    return { id: info.messageId }
  }
}

export default EmailNotificationProviderService
