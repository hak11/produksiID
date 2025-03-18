"use client"

import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { DeliveryOrderForm } from "../components/delivery-order-form"
import { DeliveryOrder, DeliveryOrderItem } from "@/lib/db/schema"
import { type DeliveryOrderFormValues } from "@/lib/validatorSchema/deliveryOrderSchema"

export default function CreateDeliveryOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: doID } = React.use(params);
  const [deliveryOrder, setDeliveryOrder] = useState<
    Partial<
      DeliveryOrder & {
        items: (DeliveryOrderItem & {
          loadQty: number
          loadPerPrice: number
          totalLoadPrice: number
          loadPerPriceStr: string
          totalLoadPriceStr: string
        })[]
      }
    >
  >({})

  const handleSave = async (deliveryOrder: DeliveryOrderFormValues) => {
    try {
      const response = await fetch("/api/delivery-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...deliveryOrder, id: doID}),
      })

      if (!response.ok) {
        throw new Error(`Failed to create delivery order: ${response.statusText}`)
      }

      toast.success("Delivery order successfully saved")
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the delivery order")
    }
  }

  useEffect(() => {
    if (doID) {
      fetchDetail(doID)
    }
  }, [doID])



  const fetchDetail = async (doId: string) => {
    const detailDO = await fetch("/api/delivery-order/" + doId).then((res) =>
      res.json()
    )

    setDeliveryOrder(detailDO)
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Delivery Order: </h1>
      </header>
      <DeliveryOrderForm deliveryOrder={deliveryOrder} isEdit={true} onSave={handleSave} />
    </div>
  )
}

