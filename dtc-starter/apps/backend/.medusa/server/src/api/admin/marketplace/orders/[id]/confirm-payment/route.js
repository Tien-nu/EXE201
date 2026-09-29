"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const transitions_1 = require("../../../../../../lib/marketplace/transitions");
/** The transfer is on the bank statement: send the order to the artisans. */
async function POST(req, res) {
    await (0, transitions_1.confirmPayment)(req.scope, req.params.id);
    res.json({ success: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21hcmtldHBsYWNlL29yZGVycy9baWRdL2NvbmZpcm0tcGF5bWVudC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLG9CQUlDO0FBUEQsK0VBQThFO0FBRTlFLDZFQUE2RTtBQUN0RSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxJQUFBLDRCQUFjLEVBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTlDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDIn0=