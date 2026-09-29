"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = exports.slugify = exports.vnWeekStart = exports.addMs = exports.formatDate = exports.formatDateTime = exports.formatVnd = void 0;
const constants_1 = require("./constants");
const formatVnd = (amount) => `${new Intl.NumberFormat("vi-VN").format(Number(amount ?? 0))}₫`;
exports.formatVnd = formatVnd;
const formatDateTime = (value) => value
    ? new Date(value).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
    : "";
exports.formatDateTime = formatDateTime;
const formatDate = (value) => value
    ? new Date(value).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
    })
    : "";
exports.formatDate = formatDate;
const addMs = (date, ms) => new Date(date.getTime() + ms);
exports.addMs = addMs;
/** Monday 00:00 in Vietnam of the week `date` falls in, as a UTC instant. */
const vnWeekStart = (date) => {
    const vn = new Date(date.getTime() + constants_1.VN_UTC_OFFSET_HOURS * constants_1.HOUR);
    // getUTCDay on the shifted date is the weekday in Vietnam (Sunday = 0).
    const daysSinceMonday = (vn.getUTCDay() + 6) % 7;
    const vnMidnight = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate());
    return new Date(vnMidnight - daysSinceMonday * constants_1.DAY - constants_1.VN_UTC_OFFSET_HOURS * constants_1.HOUR);
};
exports.vnWeekStart = vnWeekStart;
/** URL-safe handle from a Vietnamese title. */
const slugify = (value) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
exports.slugify = slugify;
const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
exports.escapeHtml = escapeHtml;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9tYXJrZXRwbGFjZS9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTREO0FBRXJELE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBZSxFQUFFLEVBQUUsQ0FDM0MsR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBO0FBRHJELFFBQUEsU0FBUyxhQUM0QztBQUUzRCxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQXVDLEVBQUUsRUFBRSxDQUN4RSxLQUFLO0lBQ0gsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7UUFDdEMsUUFBUSxFQUFFLGtCQUFrQjtRQUM1QixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLEdBQUcsRUFBRSxTQUFTO1FBQ2QsS0FBSyxFQUFFLFNBQVM7UUFDaEIsSUFBSSxFQUFFLFNBQVM7S0FDaEIsQ0FBQztJQUNKLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFWSyxRQUFBLGNBQWMsa0JBVW5CO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUF1QyxFQUFFLEVBQUUsQ0FDcEUsS0FBSztJQUNILENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7UUFDMUMsUUFBUSxFQUFFLGtCQUFrQjtLQUM3QixDQUFDO0lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUxLLFFBQUEsVUFBVSxjQUtmO0FBRUQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFVLEVBQUUsRUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7QUFBakUsUUFBQSxLQUFLLFNBQTREO0FBRTlFLDZFQUE2RTtBQUN0RSxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO0lBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRywrQkFBbUIsR0FBRyxnQkFBSSxDQUFDLENBQUE7SUFDaEUsd0VBQXdFO0lBQ3hFLE1BQU0sZUFBZSxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN6QixFQUFFLENBQUMsY0FBYyxFQUFFLEVBQ25CLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFDaEIsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUNoQixDQUFBO0lBRUQsT0FBTyxJQUFJLElBQUksQ0FDYixVQUFVLEdBQUcsZUFBZSxHQUFHLGVBQUcsR0FBRywrQkFBbUIsR0FBRyxnQkFBSSxDQUNoRSxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBYlksUUFBQSxXQUFXLGVBYXZCO0FBRUQsK0NBQStDO0FBQ3hDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FDdkMsS0FBSztLQUNGLFdBQVcsRUFBRTtLQUNiLFNBQVMsQ0FBQyxLQUFLLENBQUM7S0FDaEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7S0FDckIsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7S0FDbEIsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUM7S0FDM0IsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7S0FDdkIsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQVJKLFFBQUEsT0FBTyxXQVFIO0FBRVYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFjLEVBQUUsRUFBRSxDQUMzQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztLQUNoQixPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztLQUN0QixPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztLQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztLQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBTGYsUUFBQSxVQUFVLGNBS0sifQ==