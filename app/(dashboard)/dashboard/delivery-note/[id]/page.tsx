"use client"

import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { DeliveryNoteForm } from "../components/delivery-note-form"
import { DeliveryNotes, DeliveryNoteItems } from "@/lib/db/schema"
import { type DeliveryNoteFormValues } from "@/lib/validatorSchema/deliveryNoteSchema"

export default function CreateDeliveryNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: doID } = React.use(params);
  const [deliveryNote, setDeliveryNote] = useState<
    Partial<
      DeliveryNotes & {
        items: DeliveryNoteItems[]
      }
    >
  >({})



  const handleSave = async (deliveryNote: DeliveryNoteFormValues) => {
    try {
      const response = await fetch("/api/delivery-note", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...deliveryNote, id: doID}),
      })

      if (!response.ok) {
        throw new Error(`Failed to create delivery note: ${response.statusText}`)
      }

      toast.success("Delivery note successfully saved")
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the delivery note")
    }
  }

  useEffect(() => {
    if (doID) {
      fetchDetail(doID)
    }
  }, [doID])



  const fetchDetail = async (doId: string) => {
    const detailDO = await fetch("/api/delivery-note/" + doId).then((res) =>
      res.json()
    )

    setDeliveryNote(detailDO)
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Delivery Note: </h1>
      </header>
      <DeliveryNoteForm
        deliveryNote={deliveryNote}
        isEdit={true}
        onSave={handleSave}
      />
    </div>
  )
}

