"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Toaster } from "react-hot-toast";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BreadcrumbContext } from "@/context/BreadcrumbContext"
import React, { useContext } from "react"


export default function LayoutDemo({
  children
}: {
  children: React.ReactNode
}) {

  const { breadcrumb: breadcrumbItems } = useContext(BreadcrumbContext)

  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems &&breadcrumbItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbLink href={item.url}>{item.name}</BreadcrumbLink>
                      </BreadcrumbItem>
                    )}
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-gray-100 gap-4 p-4">
          <div className="bg-white p-4 rounded-xl">
            {children}
          </div>
        </div>
      </SidebarInset>
      <Toaster position="top-center" reverseOrder={false} />
    </SidebarProvider>
  )
}
