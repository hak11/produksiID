"use client"

import { createContext, useState } from "react"

type BreadcrumbItem = {
  name: string
  url: string
}

type BreadcrumbContext = {
  breadcrumb: BreadcrumbItem[]
  setBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void
}

export const BreadcrumbContext = createContext<BreadcrumbContext>({
  breadcrumb: [],
  setBreadcrumb: () => {},
})

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([])

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}