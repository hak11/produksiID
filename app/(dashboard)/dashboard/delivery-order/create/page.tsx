"use client"

import React from "react"
import toast from "react-hot-toast"
import { DeliveryOrderForm } from "../components/delivery-order-form"
import { useRouter } from "next/navigation"
import { DeliveryOrderFormValues } from "@/lib/validatorSchema/deliveryOrderSchema"

export default function CreateDeliveryOrderPage() {
  const router = useRouter()
  const handleSave = async (
    deliveryOrder: Partial<DeliveryOrderFormValues>,
    // callback?: () => void
  ) => {
    try {
      const response = await fetch("/api/delivery-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryOrder),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to create delivery order: ${response.statusText}`
        )
      }

      const data = await response.json()
      toast.success(
        `Delivery note successfully ${deliveryOrder.id ? "updated" : "created"}`
      )

      router.push(`/dashboard/delivery-order/${data.deliveryOrder.id}`)
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

