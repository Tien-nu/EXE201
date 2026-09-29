import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import GHNFulfillmentService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [GHNFulfillmentService],
})
