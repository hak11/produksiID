"use client"

import { BreadcrumbProvider } from "@/context/BreadcrumbContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <BreadcrumbProvider>{children}</BreadcrumbProvider>
    </section>
  )
}
