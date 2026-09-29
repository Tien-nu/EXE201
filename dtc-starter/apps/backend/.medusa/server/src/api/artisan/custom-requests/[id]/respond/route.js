"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const artisans_1 = require("../../../../../lib/marketplace/artisans");
const custom_requests_1 = require("../../../../../lib/marketplace/custom-requests");
const serialize_1 = require("../../../../../lib/marketplace/serialize");
/** One-time answer: a price and making time, or a refusal. */
async function POST(req, res) {
    const artisan = await (0, artisans_1.getAuthedArtisan)(req);
    const request = await (0, custom_requests_1.respondToCustomRequest)(req.scope, artisan.id, req.params.id, req.validatedBody);
    res.json({ custom_request: (0, serialize_1.customRequestForArtisan)(request) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FydGlzYW4vY3VzdG9tLXJlcXVlc3RzL1tpZF0vcmVzcG9uZC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLG9CQWFDO0FBbEJELHNFQUEwRTtBQUMxRSxvRkFBdUY7QUFDdkYsd0VBQWtGO0FBRWxGLDhEQUE4RDtBQUN2RCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUF5RCxFQUN6RCxHQUFtQjtJQUVuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsMkJBQWdCLEVBQUMsR0FBRyxDQUFDLENBQUE7SUFDM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHdDQUFzQixFQUMxQyxHQUFHLENBQUMsS0FBSyxFQUNULE9BQU8sQ0FBQyxFQUFFLEVBQ1YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQ2IsR0FBRyxDQUFDLGFBQWEsQ0FDbEIsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBQSxtQ0FBdUIsRUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDaEUsQ0FBQyJ9