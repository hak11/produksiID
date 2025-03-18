"use client"

import React from "react"
import toast from "react-hot-toast"
import { DeliveryNoteForm } from "../components/delivery-note-form"
import { useRouter } from "next/navigation"
import {
  DeliveryNoteFormValues,
} from "@/lib/validatorSchema/deliveryNoteSchema"

export default function CreateDeliveryNotePage() {
  const router = useRouter()
  const handleSave = async (
    deliveryNote: Partial<DeliveryNoteFormValues>,
    callback?: () => void
  ) => {
    try {
      const method = deliveryNote.id ? "PUT" : "POST"

      const response = await fetch("/api/delivery-note", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryNote),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${deliveryNote.id ? "update" : "create"} delivery note: ${
            response.statusText
          }`
        )
      }

      const data = await response.json()
      toast.success(
        `Delivery note successfully ${deliveryNote.id ? "updated" : "created"}`
      )

      router.push(`/dashboard/delivery-note/${data.deliveryNote.id}`)
      if (callback) {
        callback()
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the delivery note")
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Buat Surat Jalan / Delivery Note</h1>
      </header>
      <DeliveryNoteForm onSave={handleSave} />
    </div>
  )
}
