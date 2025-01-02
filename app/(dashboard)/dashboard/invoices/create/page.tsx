"use client"

import React from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { InvoiceForm } from "../components/invoice-form"
import { Invoice } from "@/lib/db/schema"
import { InvoicesFormValues } from "@/lib/schema/invoicesSchema"

export default function CreateInvoicePage() {
  const router = useRouter()

  const handleSave = async (
    invoice: Partial<Invoice>,
    callback?: () => void
  ) => {
    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      })

      if (!response.ok) {
        throw new Error(`Failed to create invoice: ${response.statusText}`)
      }

      toast.success("Invoice successfully created")
      if (callback) {
        callback()
      }
      router.push("/dashboard/invoices")
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the invoice")
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Create Invoice</h1>
      </header>
      <InvoiceForm onSave={handleSave} />
    </div>
  )
}
