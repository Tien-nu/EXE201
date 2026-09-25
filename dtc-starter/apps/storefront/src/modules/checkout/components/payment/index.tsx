"use client"
import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession, updateCart } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentContainer,
} from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  // Fallback to metadata if available, otherwise activeSession
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    (cart.metadata?.payment_method as string) || activeSession?.provider_id || ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  // Simulate auto-verification for Bank Transfer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isOpen && selectedPaymentMethod === "manual_bank") {
      timeoutId = setTimeout(() => {
        handleSubmit()
      }, 5000) // 5 seconds simulation
    }
    return () => clearTimeout(timeoutId)
  }, [isOpen, selectedPaymentMethod])

  const actualProviderId = (methodId: string) => {
    if (methodId === "manual_cod" || methodId === "manual_bank") return "pp_system_default"
    return methodId
  }

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: actualProviderId(method),
      })
    }
  }

  const virtualPaymentMethods = useMemo(() => {
    const methods: { id: string }[] = []
    for (const method of availablePaymentMethods) {
      if (method.id === "pp_system_default") {
        methods.push({ id: "manual_cod" })
        methods.push({ id: "manual_bank" })
      } else {
        methods.push(method)
      }
    }
    return methods
  }, [availablePaymentMethods])

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputPaymentDetails =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === actualProviderId(selectedPaymentMethod)

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: actualProviderId(selectedPaymentMethod),
        })
      }

      // Save user's specific choice (COD vs Bank) in metadata
      if (selectedPaymentMethod === "manual_cod" || selectedPaymentMethod === "manual_bank") {
        await updateCart({ metadata: { payment_method: selectedPaymentMethod } })
      }

      if (!shouldInputPaymentDetails) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {virtualPaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripePaymentContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setError={setError}
                        setPaymentComplete={setPaymentComplete}
                      />
                    ) : (
                      <div className="flex flex-col">
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                        {paymentMethod.id === "manual_bank" && selectedPaymentMethod === "manual_bank" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <Text className="txt-medium-plus font-semibold mb-2 text-center text-blue-600">Quét mã QR để chuyển khoản</Text>
                            <div className="flex justify-center mb-4">
                              <img 
                                src={`https://img.vietqr.io/image/mb-0912037670-compact2.png?amount=${cart.item_total}&addInfo=Thanh toan don hang ${cart.id.split('_')[1]}&accountName=YARNLY STORE`} 
                                alt="QR Code" 
                                className="w-64 h-auto rounded-md shadow-sm border border-gray-200 bg-white p-2" 
                              />
                            </div>
                            <Text className="txt-medium text-center">Ngân hàng: <strong>MB Bank</strong></Text>
                            <Text className="txt-medium text-center">Chủ tài khoản: <strong>YARNLY STORE</strong></Text>
                            <Text className="txt-medium text-center">Số tài khoản: <strong>0912037670</strong></Text>
                            <Text className="txt-medium text-center mt-2 text-ui-fg-subtle">
                              Nội dung chuyển khoản: <span className="font-semibold text-black">Thanh toan don hang {cart.id.split('_')[1]}</span>
                            </Text>
                            <Text className="txt-medium text-center italic text-sm mt-4 text-green-600 animate-pulse">
                              Hệ thống đang tự động kiểm tra giao dịch...
                            </Text>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {selectedPaymentMethod !== "manual_bank" && (
            <Button
              size="large"
              className="mt-6"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                (isStripeLike(selectedPaymentMethod) && !paymentComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              {!activeSession && isStripeLike(selectedPaymentMethod)
                ? "Enter payment details"
                : "Continue to review"}
            </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>Another step will appear</Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
