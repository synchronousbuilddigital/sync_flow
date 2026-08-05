"use client"

import { useSearchParams } from "next/navigation"
import { GlobalSummary } from "@/components/dashboard/global-summary"
import { AccountAnalytics } from "@/components/dashboard/account-analytics"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const network = searchParams.get("network")
  const account = searchParams.get("account")

  if (network && account) {
    return <AccountAnalytics network={network} account={account} />
  }

  return <GlobalSummary />
}
