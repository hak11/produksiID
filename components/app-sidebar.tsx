"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Settings2,
  MapPin,
  CalendarDays,
  BarChart2,
  LineChart,
} from "lucide-react"

import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/man.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMainLogistic: [
    {
      title: "Overview",
      url: "#",
      icon: BarChart2,
    },
    {
      title: "Jadwal Rute Harian",
      url: "#",
      icon: MapPin,
    },
    {
      title: "Kalender Pengiriman",
      url: "#",
      icon: CalendarDays,
    },
    {
      title: "Delivery Order",
      url: "/purchase-order/history",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "List",
          url: "/purchase-order/create",
        },
        {
          title: "Buat Surat Jalan",
          url: "/purchase-order/create",
        },
      ],
    },
    {
      title: "Invoice",
      url: "/purchase-order/history",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "List",
          url: "/invoices",
        },
        {
          title: "Buat Invoice",
          url: "/invoices/create",
        },
      ],
    },
    // {
    //   title: "Purchase Order",
    //   url: "/purchase-order/history",
    //   icon: BookOpen,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "List",
    //       url: "/purchase-order/history",
    //     },
    //     {
    //       title: "Buat Order",
    //       url: "/purchase-order/create",
    //     },
    //   ],
    // },
    {
      title: "Kelola",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Driver",
          url: "/dashboard/drivers",
        },
        {
          title: "Kendaraan",
          url: "/dashboard/cars",
        },
        {
          title: "Perusahaan (Sup/Cus)",
          url: "/dashboard/company",
        },
      ],
    },
  ],
  navMainManufacture: [
    {
      title: "Laporan Produksi",
      url: "#",
      icon: BarChart2,
    },
    {
      title: "Production Control",
      url: "#",
      icon: LineChart,
      isActive: true,
      items: [
        {
          title: "Stock Bahan",
          url: "/purchase-order/create",
        },
        {
          title: "Stock Produk Final",
          url: "/purchase-order/create",
        },
        {
          title: "QC History",
          url: "/purchase-order/create",
        },
        {
          title: "Setup Workflow",
          url: "/purchase-order/create",
        },
      ],
    },
    {
      title: "Maintenance",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Predictive Maintenance",
          url: "#",
        },
        {
          title: "Riwayat Maintenance",
          url: "#",
        },
      ],
    },
    {
      title: "Kelola",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Mesin",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link className="flex items-center ml-auto" href="/dashboard">
          <Image
            src="/logo-produksi.png"
            alt="Logo"
            priority={false}
            style={{ marginLeft: "-18px" }}
            width={200}
            height={40}
          />
        </Link>
        {/* <Link href="/" className="flex items-center">
          <Image
            src="/logo-produksi.png"
            alt="Logo"
            priority={false}
            style={{ marginLeft: "-18px" }}
            width={200}
            height={40}
          />
        </Link> */}
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMainLogistic} groupName="Logistic" />
        {/* <NavMain items={data.navMainManufacture} groupName="Manufacture" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
