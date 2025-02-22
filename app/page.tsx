"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  FileClock,
  Workflow,
  BrainCircuit,
  HandCoins,
} from "lucide-react"
import Header from "@/components/Header"


export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center lg:col-span-8 lg:text-left">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-4xl">
                  Optimalkan Bisnis Manufaktur dan Logistik Anda
                  <span className="block md:text-5xl text-red-400">
                    Kendalikan produksi untuk efisiensi
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Produksi.id adalah aplikasi all-in-one yang dirancang untuk
                  mengelola proses produksi dan logistik secara efisien. Dari
                  perencanaan hingga pelaporan, kami membantu bisnis Anda
                  menghemat waktu, mengurangi biaya, dan meningkatkan
                  produktivitas.
                </p>
                <div className="flex gap-4 mt-8 md:mx-auto md:text-left">
                  <div>
                    <a href="https://wa.me/6281281056838=text=Saya%20tertarik%20dengan%20Produksi.id" target="_blank">
                      <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                        Coba Gratis Sekarang
                      </Button>
                    </a>
                  </div>
                  <div>
                    <a href="https://wa.me/6281281056838?text=Saya%mau%20lihat%20demo" target="_blank">
                      <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                        Lihat Demo Aplikasi
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <svg viewBox="0 0 512 512" className="h-8 w-8 ml-1">
                    <path
                      fill="currentColor"
                      d="m256 120.5c-74.715 0-135.5 60.785-135.5 135.5s60.785 135.5 135.5 135.5 135.5-60.785 135.5-135.5-60.785-135.5-135.5-135.5zm0 241c-58.173 0-105.5-47.327-105.5-105.5s47.327-105.5 105.5-105.5 105.5 47.327 105.5 105.5-47.327 105.5-105.5 105.5z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m282.382 219.28-38.741 41.62-14.396-14.396c-5.857-5.857-15.355-5.857-21.213 0-5.857 5.857-5.857 15.355 0 21.213l25.389 25.389c2.815 2.815 6.632 4.394 10.606 4.394.09 0 .18-.001.269-.002 4.071-.073 7.937-1.798 10.711-4.778l49.333-53c5.645-6.063 5.304-15.555-.759-21.199-6.063-5.645-15.555-5.305-21.199.759z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m497 241h-19.939c-3.556-53.537-26.093-103.381-64.387-141.675-38.293-38.293-88.137-60.831-141.674-64.386v-19.939c0-8.284-6.716-15-15-15s-15 6.716-15 15v19.939c-53.537 3.556-103.381 26.094-141.675 64.387-38.293 38.293-60.831 88.137-64.386 141.674h-19.939c-8.284 0-15 6.716-15 15s6.716 15 15 15h19.939c3.556 53.537 26.093 103.381 64.387 141.675 38.294 38.293 88.138 60.831 141.675 64.386v19.939c0 8.284 6.716 15 15 15s15-6.716 15-15v-19.939c53.537-3.556 103.381-26.094 141.675-64.386 38.293-38.294 60.831-88.138 64.387-141.675h19.937c8.284 0 15-6.716 15-15s-6.716-15-15-15zm-226 205.986v-18.844c0-8.284-6.716-15-15-15s-15 6.716-15 15v18.844c-93.698-7.291-168.695-82.288-175.986-175.986h18.843c8.284 0 15-6.716 15-15s-6.716-15-15-15h-18.843c7.291-93.698 82.288-168.695 175.986-175.986v18.844c0 8.284 6.716 15 15 15s15-6.716 15-15v-18.844c93.698 7.291 168.695 82.288 175.986 175.986h-18.843c-8.284 0-15 6.716-15 15s6.716 15 15 15h18.843c-7.291 93.698-82.288 168.695-175.986 175.986z"
                    />
                  </svg>
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Data Akurat
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Pastikan setiap keputusan didasarkan pada informasi yang
                    terpercaya dan terperinci.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <svg viewBox="0 0 64 64" className="h-8 w-8 ml-1">
                    <path
                      fill="currentColor"
                      d="m32 58.5h-24c-2.48145 0-4.5-2.01855-4.5-4.5v-46c0-2.48145 2.01855-4.5 4.5-4.5h40c2.48145 0 4.5 2.01855 4.5 4.5v26.58984c0 .82812-.67188 1.5-1.5 1.5s-1.5-.67188-1.5-1.5v-26.58984c0-.82715-.67285-1.5-1.5-1.5h-40c-.82715 0-1.5.67285-1.5 1.5v46c0 .82715.67285 1.5 1.5 1.5h24c.82812 0 1.5.67188 1.5 1.5s-.67188 1.5-1.5 1.5z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m30 36.5h-18c-.82812 0-1.5-.67188-1.5-1.5v-23c0-.82812.67188-1.5 1.5-1.5s1.5.67188 1.5 1.5v21.5h16.5c.82812 0 1.5.67188 1.5 1.5s-.67188 1.5-1.5 1.5z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m11.99902 29.5c-.35059 0-.70215-.12207-.98633-.37109-.62402-.5459-.6875-1.49316-.1416-2.11621l7-8c.27344-.3125.66406-.49805 1.0791-.51172.40527-.02539.81738.14453 1.11035.43848l5.82812 5.82812 7.9502-9.71777c.26855-.32812.66309-.52637 1.08594-.54785.43457-.01562.83594.1377 1.13574.4375l3.81543 3.81445 2.95312-3.69141c.5166-.64648 1.45898-.75293 2.10839-.2334.64649.51758.75098 1.46094.23341 2.1084l-4 5c-.2666.33301-.66211.53613-1.08789.56055-.41992.01758-.8418-.13574-1.14355-.4375l-3.82812-3.82812-7.9502 9.71777c-.26855.32812-.66309.52637-1.08594.54785-.43848.01172-.83594-.13867-1.13574-.4375l-5.86621-5.86621-5.94434 6.79297c-.29688.33887-.71191.5127-1.12988.5127z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m28 43.5h-16c-.82812 0-1.5-.67188-1.5-1.5s.67188-1.5 1.5-1.5h16c.82812 0 1.5.67188 1.5 1.5s-.67188 1.5-1.5 1.5z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m21 49.5h-9c-.82812 0-1.5-.67188-1.5-1.5s.67188-1.5 1.5-1.5h9c.82812 0 1.5.67188 1.5 1.5s-.67188 1.5-1.5 1.5z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m46.35059 60.5c-7.80273 0-14.15039-6.34766-14.15039-14.14941 0-7.80273 6.34766-14.15039 14.15039-14.15039 7.80176 0 14.14941 6.34766 14.14941 14.15039 0 7.80176-6.34766 14.14941-14.14941 14.14941zm0-25.2998c-6.14844 0-11.15039 5.00195-11.15039 11.15039 0 6.14746 5.00195 11.14941 11.15039 11.14941 6.14746 0 11.14941-5.00195 11.14941-11.14941 0-6.14844-5.00195-11.15039-11.14941-11.15039z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m51.91211 52.96582c-.36328 0-.72754-.13086-1.01562-.39551l-5.56152-5.11523c-.30859-.28418-.48438-.68457-.48438-1.10449v-7.39453c0-.82812.67188-1.5 1.5-1.5s1.5.67188 1.5 1.5v6.73633l5.07715 4.66895c.60938.56152.64941 1.50977.08887 2.12012-.2959.32129-.7002.48438-1.10449.48438z"
                    ></path>
                  </svg>
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Monitoring Real-Time
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Pantau semua proses produksi dan logistik Anda langsung
                    melalui dashboard.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <HandCoins className="h-8 w-8" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Hemat Biaya
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Tidak perlu mengeluarkan ratusan juta untuk aplikasi,
                    server, atau tim IT. tinggal pakai
                  </p>
                </div>
              </div>

              <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <FileClock className="h-8 w-8" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Pelaporan Tepat Waktu
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Dapatkan laporan yang cepat dan akurat untuk mendukung
                    operasional bisnis Anda.
                  </p>
                </div>
              </div>

              <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <Workflow className="h-8 w-8" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Customizable Workflow
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Alur kerja yang fleksibel dan dapat disesuaikan dengan
                    kebutuhan bisnis Anda.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-400 text-white">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Proses Terintegrasi
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Produksi dan logistik terhubung dalam satu aplikasi yang
                    mudah digunakan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
