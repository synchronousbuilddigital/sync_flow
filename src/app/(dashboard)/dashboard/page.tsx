"use client"

import { useSearchParams } from "next/navigation"
import { GlobalSummary } from "@/components/dashboard/global-summary"
import { AccountAnalytics } from "@/components/dashboard/account-analytics"
import { Suspense } from "react"

function DashboardContent() {
  const searchParams = useSearchParams()
  const network = searchParams.get("network")
  const account = searchParams.get("account")

  if (network && account) {
    return <AccountAnalytics network={network} account={account} />
  }

  return <GlobalSummary />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
