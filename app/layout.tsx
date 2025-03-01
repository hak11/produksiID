import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import { UserProvider } from "@/lib/auth"
import { getUser } from "@/lib/db/queries"

export const metadata: Metadata = {
  title: "Produksi.id | Kendalikan produksi untuk efisiensi",
  description:
    "Produksi.id adalah aplikasi all-in-one yang dirancang untuk mengelola proses produksi dan logistik secara efisien. Dari perencanaan hingga pelaporan, kami membantu bisnis Anda menghemat waktu, mengurangi biaya, dan meningkatkan produktivitas operasional.",
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
