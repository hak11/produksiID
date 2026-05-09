import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import { UserProvider } from "@/lib/auth"
import { getUser } from "@/lib/db/queries"

export const metadata: Metadata = {
  title: "Logio.id | Kelola Logistik dengan Efisien",
  description:
    "Logio.id adalah aplikasi all-in-one yang dirancang untuk mengelola proses produksi dan logistik secara efisien. Dari perencanaan hingga pelaporan, kami membantu bisnis Anda menghemat waktu, mengurangi biaya, dan meningkatkan produktivitas operasional.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Logio.id | Kelola Logistik dengan Efisien",
    description:
      "Logio.id adalah aplikasi all-in-one yang dirancang untuk mengelola proses produksi dan logistik secara efisien.",
    url: "https://logio.id",
    siteName: "Logio.id",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logio.id – Kelola Logistik dengan Efisien",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logio.id | Kelola Logistik dengan Efisien",
    description:
      "Logio.id adalah aplikasi all-in-one yang dirancang untuk mengelola proses produksi dan logistik secara efisien.",
    images: ["/og-image.jpg"],
  },
}

export const viewport: Viewport = {
  maximumScale: 1,
}

const manrope = Manrope({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userPromise = getUser()

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  )
}
