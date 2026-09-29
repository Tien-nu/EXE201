"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_1 = __importDefault(require("@medusajs/medusa/product"));
const marketplace_1 = __importDefault(require("../modules/marketplace"));
// Every product belongs to exactly one artisan's shop.
exports.default = (0, utils_1.defineLink)(marketplace_1.default.linkable.artisan, {
    linkable: product_1.default.linkable.product,
    isList: true,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aXNhbi1wcm9kdWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpbmtzL2FydGlzYW4tcHJvZHVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFzRDtBQUN0RCx1RUFBb0Q7QUFDcEQseUVBQXNEO0FBRXRELHVEQUF1RDtBQUN2RCxrQkFBZSxJQUFBLGtCQUFVLEVBQUMscUJBQWlCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtJQUM1RCxRQUFRLEVBQUUsaUJBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTztJQUN4QyxNQUFNLEVBQUUsSUFBSTtDQUNiLENBQUMsQ0FBQSJ9