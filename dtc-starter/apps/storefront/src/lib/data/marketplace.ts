"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getOrSetCart } from "./cart"
import { getAuthHeaders, getCacheTag } from "./cookies"
import type {
  CustomRequest,
  MarketplaceOrder,
  ProductArtisan,
  PublicArtisan,
} from "@lib/marketplace-types"

type ActionResult = { error: string | null }

const toError = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

/** Who makes a product, and whether it is ready-made or made to order. */
export async function getProductArtisan(
  productId: string
): Promise<ProductArtisan | null> {
  return sdk.client
    .fetch<ProductArtisan>(`/store/artisans/by-product/${productId}`, {
      next: { revalidate: 60 },
    })
    .catch(() => null)
}

export async function listArtisans(): Promise<PublicArtisan[]> {
  return sdk.client
    .fetch<{ artisans: PublicArtisan[] }>(`/store/artisans`, {
      next: { revalidate: 60 },
    })
    .then(({ artisans }) => artisans)
    .catch(() => [])
}

export async function getArtisanShop(
  handle: string
): Promise<{ artisan: PublicArtisan; product_ids: string[] } | null> {
  return sdk.client
    .fetch<{ artisan: PublicArtisan; product_ids: string[] }>(
      `/store/artisans/${handle}`,
      { next: { revalidate: 60 } }
    )
    .catch(() => null)
}

// ---- Orders (logged-in customer) ------------------------------------------

export async function getMarketplaceOrder(
  orderId: string
): Promise<MarketplaceOrder | null> {
  return sdk.client
    .fetch<{ order: MarketplaceOrder }>(`/store/marketplace/orders/${orderId}`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
    .then(({ order }) => order)
    .catch(() => null)
}

export async function listMarketplaceOrders(): Promise<MarketplaceOrder[]> {
  return sdk.client
    .fetch<{ orders: MarketplaceOrder[] }>(`/store/marketplace/orders`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
    .then(({ orders }) => orders)
    .catch(() => [])
}

export async function submitTransfer(orderId: string): Promise<ActionResult> {
  try {
    await sdk.client.fetch(
      `/store/marketplace/orders/${orderId}/transfer-submitted`,
      { method: "POST", headers: await getAuthHeaders() }
    )
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

export async function cancelSubOrder(subOrderId: string): Promise<ActionResult> {
  try {
    await sdk.client.fetch(`/store/marketplace/sub-orders/${subOrderId}/cancel`, {
      method: "POST",
      headers: await getAuthHeaders(),
    })
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

// ---- Custom requests --------------------------------------------------------

export async function listCustomRequests(): Promise<CustomRequest[]> {
  return sdk.client
    .fetch<{ custom_requests: CustomRequest[] }>(
      `/store/marketplace/custom-requests`,
      { headers: await getAuthHeaders(), cache: "no-store" }
    )
    .then(({ custom_requests }) => custom_requests)
    .catch(() => [])
}

export async function createCustomRequest(input: {
  product_id: string
  description: string
  color?: string
  size?: string
  quantity?: number
}): Promise<ActionResult> {
  try {
    await sdk.client.fetch(`/store/marketplace/custom-requests`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: input,
    })
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

/** Accepting puts the item in the cart at the artisan's quoted price. */
export async function decideCustomRequest(
  requestId: string,
  accept: boolean,
  countryCode: string
): Promise<ActionResult> {
  try {
    const cart = accept ? await getOrSetCart(countryCode) : null

    await sdk.client.fetch(
      `/store/marketplace/custom-requests/${requestId}/decide`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: { accept, ...(cart ? { cart_id: cart.id } : {}) },
      }
    )

    if (accept) {
      revalidateTag(await getCacheTag("carts"))
    }

    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}
