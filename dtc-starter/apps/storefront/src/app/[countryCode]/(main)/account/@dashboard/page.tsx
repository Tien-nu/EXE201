import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound, redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ next?: string }>
}) {
  const [{ countryCode }, { next }] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  // Signed in from the checkout's login wall: go back to paying.
  if (next === "checkout") {
    redirect(`/${countryCode}/checkout?step=address`)
  }

  const orders = (await listOrders().catch(() => null)) || null

  return <Overview customer={customer} orders={orders} />
}
