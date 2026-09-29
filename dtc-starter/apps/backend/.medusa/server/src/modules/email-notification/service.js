"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Sends emails through SMTP (e.g. Gmail with an app password). Without SMTP
 * credentials it only logs each email, so the flows still work in development.
 *
 * Callers render the email themselves and pass `{ subject, html }` as data.
 */
class EmailNotificationProviderService extends utils_1.AbstractNotificationProviderService {
    constructor({ logger }, options) {
        super();
        this.logger_ = logger;
        this.options_ = options;
        this.transporter_ =
            options.host && options.user && options.pass
                ? nodemailer_1.default.createTransport({
                    host: options.host,
                    port: options.port ?? 465,
                    secure: (options.port ?? 465) === 465,
                    auth: { user: options.user, pass: options.pass },
                })
                : null;
    }
    async send(notification) {
        const data = (notification.data ?? {});
        const subject = data.subject ?? notification.template;
        const html = data.html ?? "";
        if (!this.transporter_) {
            this.logger_.info(`[email:dev] to=${notification.to} subject="${subject}" (SMTP not configured, email not sent)`);
            return {};
        }
        const info = await this.transporter_.sendMail({
            from: this.options_.from ?? this.options_.user,
            to: notification.to,
            subject,
            html,
        });
        return { id: info.messageId };
    }
}
EmailNotificationProviderService.identifier = "yarnly-email";
exports.default = EmailNotificationProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2VtYWlsLW5vdGlmaWNhdGlvbi9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EscURBQStFO0FBQy9FLDREQUF5RDtBQWN6RDs7Ozs7R0FLRztBQUNILE1BQU0sZ0NBQWlDLFNBQVEsMkNBQW1DO0lBT2hGLFlBQVksRUFBRSxNQUFNLEVBQXdCLEVBQUUsT0FBZ0I7UUFDNUQsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixJQUFJLENBQUMsWUFBWTtZQUNmLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSTtnQkFDMUMsQ0FBQyxDQUFDLG9CQUFVLENBQUMsZUFBZSxDQUFDO29CQUN6QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7b0JBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLEdBQUc7b0JBQ3pCLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssR0FBRztvQkFDckMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUU7aUJBQ2pELENBQUM7Z0JBQ0osQ0FBQyxDQUFDLElBQUksQ0FBQTtJQUNaLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUNSLFlBQTJEO1FBRTNELE1BQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxFQUFFLENBQXdDLENBQUE7UUFDN0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFBO1FBQ3JELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1FBRTVCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2Ysa0JBQWtCLFlBQVksQ0FBQyxFQUFFLGFBQWEsT0FBTyx5Q0FBeUMsQ0FDL0YsQ0FBQTtZQUNELE9BQU8sRUFBRSxDQUFBO1FBQ1gsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7WUFDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUM5QyxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7WUFDbkIsT0FBTztZQUNQLElBQUk7U0FDTCxDQUFDLENBQUE7UUFFRixPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtJQUMvQixDQUFDOztBQTNDTSwyQ0FBVSxHQUFHLGNBQWMsQ0FBQTtBQThDcEMsa0JBQWUsZ0NBQWdDLENBQUEifQ==