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

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
      title: "Purchase Order",
      url: "/purchase-order/history",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "List",
          url: "/purchase-order/history",
        },
        {
          title: "Buat Order",
          url: "/purchase-order/create",
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
          title: "Driver",
          url: "#",
        },
        {
          title: "Kendaraan",
          url: "#",
        },
        {
          title: "Supplier",
          url: "#",
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
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMainLogistic} groupName="Logistic" />
        {/* <NavMain items={data.navMainManufacture} groupName="Manufacture" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
