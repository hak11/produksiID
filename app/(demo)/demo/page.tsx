"use client"

import { useContext, useEffect } from "react"
import { BreadcrumbContext } from "@/context/BreadcrumbContext"

function Page() {
  const { setBreadcrumb } = useContext(BreadcrumbContext)

  useEffect(() => {
    setBreadcrumb([{ name: "Logistic", url: "#" }, { name: "Overview", url: "/demo/overview" }])
  }, [])

  return <h1>testing</h1>
}

Page.breadcrumbItems = ["Demo"]

export default Page
