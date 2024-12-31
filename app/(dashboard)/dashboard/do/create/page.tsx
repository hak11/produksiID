"use client"

import React from "react"
import toast from "react-hot-toast"
import { DeliveryOrderForm } from "../components/delivery-order-form"
import { DeliveryOrder } from "@/lib/db/schema"

export default function CreateDeliveryOrderPage() {
  const handleSave = async (deliveryOrder: Partial<DeliveryOrder>) => {
    try {
      const response = await fetch("/api/delivery-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryOrder),
      })

      if (!response.ok) {
        throw new Error(`Failed to create delivery order: ${response.statusText}`)
      }

      toast.success("Delivery order successfully created")
      // You might want to redirect to the list page or clear the form here
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the delivery order")
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Create Delivery Order</h1>
      </header>
      <DeliveryOrderForm onSave={handleSave} />
    </div>
  )
}

