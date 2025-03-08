"use client"

import React from "react"
import toast from "react-hot-toast"
import { DeliveryNoteForm } from "../components/delivery-note-form"
import { DeliveryNotes } from "@/lib/db/schema"

export default function CreateDeliveryNotePage() {
  const handleSave = async (
    deliveryNote: Partial<DeliveryNotes>,
    callback?: () => void
  ) => {
    try {
      const response = await fetch("/api/delivery-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryNote),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to create delivery note: ${response.statusText}`
        )
      }

      toast.success("Delivery note successfully created")
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
        <h1 className="text-2xl font-bold">Create Delivery Note</h1>
      </header>
      <DeliveryNoteForm onSave={handleSave} />
    </div>
  )
}
