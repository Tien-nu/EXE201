import { MedusaError } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"

// Guests may browse and fill a cart, but only registered customers can pay.
completeCartWorkflow.hooks.validate(async ({ cart }) => {
  const customer = (cart as { customer?: { has_account?: boolean } | null })
    .customer

  if (!customer?.has_account) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Vui lòng đăng nhập hoặc đăng ký để thanh toán"
    )
  }
})
