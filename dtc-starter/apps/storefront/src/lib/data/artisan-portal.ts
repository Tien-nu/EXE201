"use server"

import { sdk } from "@lib/config"
import type {
  Artisan,
  ArtisanDashboard,
  ArtisanProduct,
  ArtisanSubOrder,
  CustomRequest,
  Payout,
} from "@lib/marketplace-types"
import { cookies as nextCookies } from "next/headers"
import { redirect } from "next/navigation"

const TOKEN_COOKIE = "_yarnly_artisan_jwt"

// `values` echoes what was typed (never the password): React resets the form
// after an action, and the fields fall back to these as their defaults.
export type FormState = {
  error: string | null
  success?: boolean
  values?: Record<string, string>
} | null

const toError = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

async function setToken(token: string) {
  const cookies = await nextCookies()
  cookies.set(TOKEN_COOKIE, token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

async function authHeaders(): Promise<Record<string, string>> {
  const cookies = await nextCookies()
  const token = cookies.get(TOKEN_COOKIE)?.value
  return token ? { authorization: `Bearer ${token}` } : {}
}

/** Calls the artisan API with the artisan's token; never cached. */
async function artisanFetch<T>(
  path: string,
  init: { method?: "GET" | "POST" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  return sdk.client.fetch<T>(`/artisan${path}`, {
    method: init.method ?? "GET",
    headers: await authHeaders(),
    body: init.body as Record<string, unknown> | undefined,
    cache: "no-store",
  })
}

const authToken = (email: string, password: string, action: "" | "/register") =>
  sdk.client
    .fetch<{ token: string }>(`/auth/artisan/emailpass${action}`, {
      method: "POST",
      body: { email, password },
    })
    .then(({ token }) => token)

// ---- Auth -----------------------------------------------------------------

export async function artisanLogin(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const countryCode = String(formData.get("country_code") ?? "vn")

  try {
    await setToken(await authToken(email, password, ""))
    // Accounts without a shop get a token too; make sure this one has one.
    await artisanFetch("/me")
  } catch {
    return {
      error: "Email hoặc mật khẩu không đúng, hoặc tài khoản chưa có gian hàng",
      values: { email },
    }
  }

  redirect(`/${countryCode}/kenh-nghe-nhan`)
}

const PROFILE_FIELDS = [
  "shop_name",
  "full_name",
  "phone",
  "description",
  "pickup_address",
  "bank_name",
  "bank_account_number",
  "bank_account_name",
] as const

const readProfile = (formData: FormData) =>
  Object.fromEntries(
    PROFILE_FIELDS.map((field) => [field, String(formData.get(field) ?? "").trim()])
  )

export async function artisanRegister(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const countryCode = String(formData.get("country_code") ?? "vn")
  const values = { email, ...readProfile(formData) }

  if (password.length < 8) {
    return { error: "Mật khẩu tối thiểu 8 ký tự", values }
  }

  let token: string

  try {
    token = await authToken(email, password, "/register")
  } catch {
    // The email may already log in as a customer: reuse that identity.
    try {
      token = await authToken(email, password, "")
    } catch {
      return {
        error: "Email này đã được dùng. Hãy nhập đúng mật khẩu của email đó hoặc dùng email khác.",
        values,
      }
    }
  }

  try {
    await sdk.client.fetch(`/artisan/register`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: values,
    })
    // Log in again so the token carries the new artisan id.
    await setToken(await authToken(email, password, ""))
  } catch (error) {
    return { error: toError(error), values }
  }

  redirect(`/${countryCode}/kenh-nghe-nhan`)
}

export async function artisanLogout(countryCode: string) {
  const cookies = await nextCookies()
  cookies.set(TOKEN_COOKIE, "", { maxAge: -1 })
  redirect(`/${countryCode}/kenh-nghe-nhan/dang-nhap`)
}

/** The logged-in artisan, or null. Works while the shop is pending too. */
export async function getArtisanMe(): Promise<Artisan | null> {
  const headers = await authHeaders()

  if (!headers.authorization) {
    return null
  }

  return artisanFetch<{ artisan: Artisan }>("/me")
    .then(({ artisan }) => artisan)
    .catch(() => null)
}

export async function updateArtisanProfile(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const values = readProfile(formData)

  try {
    await artisanFetch("/me", { method: "POST", body: values })
    return { error: null, success: true, values }
  } catch (error) {
    return { error: toError(error), values }
  }
}

// ---- Reads ------------------------------------------------------------------
// Reads return empty values on failure: the portal layout already shows why a
// pending or locked shop cannot use the pages rendered next to it.

export async function getArtisanDashboard() {
  return artisanFetch<ArtisanDashboard>("/dashboard").catch(() => null)
}

export async function listArtisanProducts() {
  return artisanFetch<{ products: ArtisanProduct[] }>("/products")
    .then(({ products }) => products)
    .catch(() => [] as ArtisanProduct[])
}

export async function getArtisanProduct(id: string) {
  return artisanFetch<{ product: ArtisanProduct }>(`/products/${id}`)
    .then(({ product }) => product)
    .catch(() => null)
}

export async function listArtisanCategories() {
  return artisanFetch<{ categories: { id: string; name: string }[] }>("/categories")
    .then(({ categories }) => categories)
    .catch(() => [])
}

export async function listArtisanSubOrders(status?: string) {
  return artisanFetch<{ sub_orders: ArtisanSubOrder[] }>(
    `/sub-orders${status ? `?status=${status}` : ""}`
  )
    .then(({ sub_orders }) => sub_orders)
    .catch(() => [] as ArtisanSubOrder[])
}

export async function getArtisanSubOrder(id: string) {
  return artisanFetch<{ sub_order: ArtisanSubOrder }>(`/sub-orders/${id}`)
    .then(({ sub_order }) => sub_order)
    .catch(() => null)
}

export async function listArtisanCustomRequests() {
  return artisanFetch<{ custom_requests: CustomRequest[] }>("/custom-requests")
    .then(({ custom_requests }) => custom_requests)
    .catch(() => [] as CustomRequest[])
}

export async function listArtisanPayouts() {
  return artisanFetch<{ payouts: Payout[] }>("/payouts")
    .then(({ payouts }) => payouts)
    .catch(() => [] as Payout[])
}

// ---- Mutations --------------------------------------------------------------

type Result = { error: string | null }

const run = async (action: () => Promise<unknown>): Promise<Result> => {
  try {
    await action()
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

export type ProductPayload = {
  title: string
  description?: string
  fulfillment_type: "ready" | "made_to_order"
  lead_days?: number | null
  images?: string[]
  category_ids?: string[]
  status?: "published" | "draft"
  price?: number
  stock?: number | null
  variants?: { id: string; price: number; stock?: number | null }[]
}

export async function saveArtisanProduct(
  id: string | null,
  payload: ProductPayload
): Promise<Result & { id?: string }> {
  try {
    const { product } = await artisanFetch<{ product: ArtisanProduct }>(
      id ? `/products/${id}` : "/products",
      { method: "POST", body: payload }
    )
    return { error: null, id: product.id }
  } catch (error) {
    return { error: toError(error) }
  }
}

export async function deleteArtisanProduct(id: string) {
  return run(() => artisanFetch(`/products/${id}`, { method: "DELETE" }))
}

/** Product photos go through here so the browser never holds the token. */
export async function uploadArtisanImages(
  formData: FormData
): Promise<Result & { urls: string[] }> {
  try {
    const files = formData.getAll("files").filter((file): file is File => file instanceof File)
    const payload = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        mime_type: file.type,
        content_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      }))
    )
    const { files: uploaded } = await artisanFetch<{ files: { url: string }[] }>(
      "/uploads",
      { method: "POST", body: { files: payload } }
    )
    return { error: null, urls: uploaded.map((file) => file.url) }
  } catch (error) {
    return { error: toError(error), urls: [] }
  }
}

export async function acceptSubOrder(id: string) {
  return run(() => artisanFetch(`/sub-orders/${id}/accept`, { method: "POST" }))
}

export async function declineSubOrder(id: string, reason: string) {
  return run(() =>
    artisanFetch(`/sub-orders/${id}/decline`, { method: "POST", body: { reason } })
  )
}

export async function markSubOrderReady(id: string) {
  return run(() => artisanFetch(`/sub-orders/${id}/ready`, { method: "POST" }))
}

export async function respondCustomRequest(
  id: string,
  body: { accept: boolean; price?: number; lead_days?: number; note?: string }
) {
  return run(() =>
    artisanFetch(`/custom-requests/${id}/respond`, { method: "POST", body })
  )
}
