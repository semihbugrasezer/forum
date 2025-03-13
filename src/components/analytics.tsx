"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function Analytics() {
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