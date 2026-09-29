"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_flows_1 = require("@medusajs/medusa/core-flows");
const artisans_1 = require("../../../lib/marketplace/artisans");
/** Product photos, sent as base64 JSON by the storefront server. */
async function POST(req, res) {
    await (0, artisans_1.getAuthedArtisan)(req);
    const { result } = await (0, core_flows_1.uploadFilesWorkflow)(req.scope).run({
        input: {
            files: req.validatedBody.files.map((file) => ({
                filename: file.filename,
                mimeType: file.mime_type,
                content: file.content_base64,
                access: "public",
            })),
        },
    });
    res.json({ files: result.map((file) => ({ id: file.id, url: file.url })) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vdXBsb2Fkcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVNBLG9CQWtCQztBQXZCRCw0REFBaUU7QUFFakUsZ0VBQW9FO0FBRXBFLG9FQUFvRTtBQUM3RCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUEyQyxFQUMzQyxHQUFtQjtJQUVuQixNQUFNLElBQUEsMkJBQWdCLEVBQUMsR0FBRyxDQUFDLENBQUE7SUFFM0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxnQ0FBbUIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzFELEtBQUssRUFBRTtZQUNMLEtBQUssRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzVDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQzVCLE1BQU0sRUFBRSxRQUFpQjthQUMxQixDQUFDLENBQUM7U0FDSjtLQUNGLENBQUMsQ0FBQTtJQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUM3RSxDQUFDIn0=