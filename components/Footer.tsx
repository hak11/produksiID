// import Link from "next/link"
// import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <p className="text-sm mb-2 md:mb-0">
          &copy;{new Date().getFullYear()} produksi.id@0.1.1 - All rights
          reserved.
        </p>

        {/* <div className="flex space-x-4">
          <Link
            href="#"
            aria-label="Facebook"
            className="hover:text-gray-400 transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            aria-label="Instagram"
            className="hover:text-gray-400 transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            aria-label="Twitter"
            className="hover:text-gray-400 transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            aria-label="YouTube"
            className="hover:text-gray-400 transition-colors"
          >
            <Youtube className="h-5 w-5" />
          </Link>
        </div> */}
      </div>
    </footer>
  )
}
