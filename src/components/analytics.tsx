"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Component to handle search params that needs to be wrapped in Suspense
function AnalyticsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      // Google Analytics tracking code
      window.gtag?.("config", process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pathname,
      })
    }
  }, [pathname, searchParams])

  return <VercelAnalytics />
}

export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  )
} 