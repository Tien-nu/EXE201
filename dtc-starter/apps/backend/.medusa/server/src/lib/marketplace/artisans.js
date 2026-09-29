"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLIC_ARTISAN_FIELDS = void 0;
exports.getAuthedArtisan = getAuthedArtisan;
exports.registerArtisan = registerArtisan;
exports.createArtisanByAdmin = createArtisanByAdmin;
exports.setArtisanStatus = setArtisanStatus;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const marketplace_1 = require("../../modules/marketplace");
const constants_1 = require("./constants");
const format_1 = require("./format");
const notify_1 = require("./notify");
/** Fields returned to the artisan and the storefront; never the bank info publicly. */
exports.PUBLIC_ARTISAN_FIELDS = [
    "id",
    "handle",
    "shop_name",
    "description",
    "avatar_url",
    "created_at",
];
const marketplaceService = (container) => container.resolve(marketplace_1.MARKETPLACE_MODULE);
/**
 * The artisan behind the request's token. Pending, rejected and locked
 * artisans may only read their own account unless `requireActive` is false.
 */
async function getAuthedArtisan(req, { requireActive = true } = {}) {
    const artisanId = req.auth_context?.actor_id;
    if (!artisanId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Bạn cần đăng nhập bằng tài khoản nghệ nhân");
    }
    const artisan = await marketplaceService(req.scope).retrieveArtisan(artisanId);
    if (requireActive && artisan.status !== "active") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, artisan.status === "pending"
            ? "Tài khoản đang chờ Admin duyệt"
            : "Tài khoản nghệ nhân đã bị từ chối hoặc khoá");
    }
    return artisan;
}
async function uniqueHandle(container, shopName) {
    const base = (0, format_1.slugify)(shopName) || "nghe-nhan";
    const marketplace = marketplaceService(container);
    for (let attempt = 0; attempt < 20; attempt++) {
        const handle = attempt ? `${base}-${attempt + 1}` : base;
        const [taken] = await marketplace.listArtisans({ handle }, { take: 1 });
        if (!taken) {
            return handle;
        }
    }
    return `${base}-${Date.now()}`;
}
async function linkAuthIdentity(container, authIdentityId, artisanId) {
    const auth = container.resolve(utils_1.Modules.AUTH);
    const identity = await auth.retrieveAuthIdentity(authIdentityId);
    await auth.updateAuthIdentities({
        id: authIdentityId,
        app_metadata: { ...(identity.app_metadata ?? {}), artisan_id: artisanId },
    });
}
/** Self sign-up: the artisan registered an auth identity and waits for approval. */
async function registerArtisan(container, authIdentityId, profile) {
    const marketplace = marketplaceService(container);
    const [existing] = await marketplace.listArtisans({ email: profile.email });
    if (existing) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, "Email này đã đăng ký gian hàng");
    }
    const artisan = await marketplace.createArtisans({
        ...profile,
        handle: await uniqueHandle(container, profile.shop_name),
        status: "pending",
    });
    await linkAuthIdentity(container, authIdentityId, artisan.id);
    await (0, notify_1.notifyAdmin)(container, `Nghệ nhân mới đăng ký: ${profile.shop_name}`, (0, notify_1.paragraph)(`${(0, format_1.escapeHtml)(profile.full_name)} (${(0, format_1.escapeHtml)(profile.email)}, ${(0, format_1.escapeHtml)(profile.phone)}) vừa đăng ký gian hàng <b>${(0, format_1.escapeHtml)(profile.shop_name)}</b>. Vào Admin → Nghệ nhân để duyệt.`));
    return artisan;
}
/** An admin opens a shop directly; it is active right away. */
async function createArtisanByAdmin(container, input) {
    const { password, ...profile } = input;
    const marketplace = marketplaceService(container);
    const auth = container.resolve(utils_1.Modules.AUTH);
    const [existing] = await marketplace.listArtisans({ email: profile.email });
    if (existing) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, "Email này đã có gian hàng");
    }
    const { success, authIdentity, error } = await auth.register("emailpass", {
        body: { email: profile.email, password },
    });
    if (!success || !authIdentity) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, error?.includes("exists")
            ? "Email này đã có tài khoản trên Yarnly. Hãy để nghệ nhân tự đăng ký bằng email đó."
            : error || "Không tạo được tài khoản đăng nhập");
    }
    const artisan = await marketplace.createArtisans({
        ...profile,
        handle: await uniqueHandle(container, profile.shop_name),
        status: "active",
    });
    await linkAuthIdentity(container, authIdentity.id, artisan.id);
    await (0, notify_1.sendEmail)(container, profile.email, "Yarnly đã tạo gian hàng cho bạn", (0, notify_1.paragraph)(`Gian hàng <b>${(0, format_1.escapeHtml)(profile.shop_name)}</b> của bạn đã được tạo. Đăng nhập Kênh nghệ nhân bằng email ${(0, format_1.escapeHtml)(profile.email)} và mật khẩu Admin đã gửi cho bạn.`) + (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/kenh-nghe-nhan/dang-nhap`, "Đăng nhập Kênh nghệ nhân"));
    return artisan;
}
async function setProductsVisible(container, artisanId, visible) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: [artisan], } = await query.graph({
        entity: "artisan",
        fields: ["products.id", "products.status", "products.metadata"],
        filters: { id: artisanId },
    });
    for (const product of (artisan?.products ?? [])) {
        const hiddenByLock = product.metadata?.hidden_by_lock === true;
        if (!visible && product.status === "published") {
            await (0, core_flows_1.updateProductsWorkflow)(container).run({
                input: {
                    selector: { id: product.id },
                    update: {
                        status: "draft",
                        metadata: { ...product.metadata, hidden_by_lock: true },
                    },
                },
            });
        }
        else if (visible && hiddenByLock) {
            await (0, core_flows_1.updateProductsWorkflow)(container).run({
                input: {
                    selector: { id: product.id },
                    update: {
                        status: "published",
                        metadata: { ...product.metadata, hidden_by_lock: false },
                    },
                },
            });
        }
    }
}
const STATUS_EMAILS = {
    active: () => [
        "Gian hàng của bạn đã được duyệt",
        (0, notify_1.paragraph)("Chúc mừng! Bạn đã có thể đăng sản phẩm và nhận đơn trên Yarnly.") +
            (0, notify_1.link)(`${constants_1.STOREFRONT_URL}/kenh-nghe-nhan`, "Vào Kênh nghệ nhân"),
    ],
    rejected: (reason) => [
        "Đăng ký gian hàng chưa được duyệt",
        (0, notify_1.paragraph)(`Lý do: ${(0, format_1.escapeHtml)(reason || "không có")}`),
    ],
    locked: (reason) => [
        "Gian hàng của bạn đã bị khoá",
        (0, notify_1.paragraph)(`Lý do: ${(0, format_1.escapeHtml)(reason || "không có")}. Sản phẩm của bạn tạm thời bị ẩn khỏi sàn.`),
    ],
};
/** approve / reject / lock / unlock from the admin. */
async function setArtisanStatus(container, artisanId, status, reason) {
    const marketplace = marketplaceService(container);
    const artisan = await marketplace.retrieveArtisan(artisanId);
    const updated = await marketplace.updateArtisans({
        id: artisan.id,
        status,
        status_reason: status === "active" ? null : reason ?? null,
    });
    if (status === "locked") {
        await setProductsVisible(container, artisan.id, false);
    }
    else if (status === "active" && artisan.status === "locked") {
        await setProductsVisible(container, artisan.id, true);
    }
    const [subject, body] = STATUS_EMAILS[status](reason);
    await (0, notify_1.sendEmail)(container, artisan.email, subject, body);
    return updated;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aXNhbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL21hcmtldHBsYWNlL2FydGlzYW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQW9EQSw0Q0F5QkM7QUFpQ0QsMENBZ0NDO0FBR0Qsb0RBZ0RDO0FBOERELDRDQXlCQztBQW5SRCxxREFJa0M7QUFDbEMsNERBQW9FO0FBQ3BFLDJEQUE4RDtBQUU5RCwyQ0FBNEM7QUFDNUMscUNBQThDO0FBQzlDLHFDQUFrRTtBQW9CbEUsdUZBQXVGO0FBQzFFLFFBQUEscUJBQXFCLEdBQUc7SUFDbkMsSUFBSTtJQUNKLFFBQVE7SUFDUixXQUFXO0lBQ1gsYUFBYTtJQUNiLFlBQVk7SUFDWixZQUFZO0NBQ0osQ0FBQTtBQUVWLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxTQUEwQixFQUE0QixFQUFFLENBQ2xGLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0NBQWtCLENBQUMsQ0FBQTtBQUV2Qzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQ3BDLEdBQStDLEVBQy9DLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUU7SUFFN0IsTUFBTSxTQUFTLEdBQUksR0FBa0MsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFBO0lBRTVFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLDRDQUE0QyxDQUM3QyxDQUFBO0lBQ0gsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUU5RSxJQUFJLGFBQWEsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFD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