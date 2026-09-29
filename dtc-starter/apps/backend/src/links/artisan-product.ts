import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import MarketplaceModule from "../modules/marketplace"

// Every product belongs to exactly one artisan's shop.
export default defineLink(MarketplaceModule.linkable.artisan, {
  linkable: ProductModule.linkable.product,
  isList: true,
})
