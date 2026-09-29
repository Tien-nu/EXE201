"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = exports.paragraph = void 0;
exports.sendEmail = sendEmail;
exports.notifyAdmin = notifyAdmin;
const utils_1 = require("@medusajs/framework/utils");
const marketplace_1 = require("../../modules/marketplace");
const format_1 = require("./format");
const layout = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
  <h2 style="color:#7c3aed;margin-bottom:4px">Yarnly</h2>
  <h3 style="margin-top:0">${(0, format_1.escapeHtml)(title)}</h3>
  ${body}
  <p style="color:#6b7280;font-size:12px;margin-top:32px">Email tự động từ sàn đồ len handmade Yarnly.</p>
</div>`;
/** Sends one email; a failure is logged and never breaks the calling flow. */
async function sendEmail(container, to, subject, body) {
    if (!to) {
        return;
    }
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    try {
        const notification = container.resolve(utils_1.Modules.NOTIFICATION);
        await notification.createNotifications({
            to,
            channel: "email",
            template: "yarnly",
            data: { subject, html: layout(subject, body) },
        });
    }
    catch (error) {
        logger.warn(`Could not send email "${subject}" to ${to}: ${error.message}`);
    }
}
/** Sends an email to the admin Gmail configured in the platform settings. */
async function notifyAdmin(container, subject, body) {
    const marketplace = container.resolve(marketplace_1.MARKETPLACE_MODULE);
    const settings = await marketplace.getSettings();
    const to = settings.admin_email || process.env.ADMIN_NOTIFY_EMAIL;
    if (!to) {
        container
            .resolve(utils_1.ContainerRegistrationKeys.LOGGER)
            .warn(`Admin email "${subject}" skipped: set the admin Gmail in Admin → Đối soát`);
        return;
    }
    await sendEmail(container, to, subject, body);
}
const paragraph = (text) => `<p style="line-height:1.5">${text}</p>`;
exports.paragraph = paragraph;
const link = (href, label) => `<p><a href="${href}" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${(0, format_1.escapeHtml)(label)}</a></p>`;
exports.link = link;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9ub3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZUEsOEJBeUJDO0FBR0Qsa0NBa0JDO0FBNURELHFEQUE4RTtBQUM5RSwyREFBOEQ7QUFFOUQscUNBQXFDO0FBRXJDLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBYSxFQUFFLElBQVksRUFBRSxFQUFFLENBQUM7Ozs2QkFHbkIsSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQztJQUMxQyxJQUFJOztPQUVELENBQUE7QUFFUCw4RUFBOEU7QUFDdkUsS0FBSyxVQUFVLFNBQVMsQ0FDN0IsU0FBMEIsRUFDMUIsRUFBNkIsRUFDN0IsT0FBZSxFQUNmLElBQVk7SUFFWixJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDUixPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFbEUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDNUQsTUFBTSxZQUFZLENBQUMsbUJBQW1CLENBQUM7WUFDckMsRUFBRTtZQUNGLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtTQUMvQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQ1QseUJBQXlCLE9BQU8sUUFBUSxFQUFFLEtBQU0sS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUMxRSxDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCw2RUFBNkU7QUFDdEUsS0FBSyxVQUFVLFdBQVcsQ0FDL0IsU0FBMEIsRUFDMUIsT0FBZSxFQUNmLElBQVk7SUFFWixNQUFNLFdBQVcsR0FDZixTQUFTLENBQUMsT0FBTyxDQUFDLGdDQUFrQixDQUFDLENBQUE7SUFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDaEQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFBO0lBRWpFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNSLFNBQVM7YUFDTixPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDO2FBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsT0FBTyxvREFBb0QsQ0FBQyxDQUFBO1FBQ3BGLE9BQU07SUFDUixDQUFDO0lBRUQsTUFBTSxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDL0MsQ0FBQztBQUVNLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FDeEMsOEJBQThCLElBQUksTUFBTSxDQUFBO0FBRDdCLFFBQUEsU0FBUyxhQUNvQjtBQUVuQyxNQUFNLElBQUksR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsRUFBRSxDQUNsRCxlQUFlLElBQUkseUhBQXlILElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUMsVUFBVSxDQUFBO0FBRDVKLFFBQUEsSUFBSSxRQUN3SiJ9