"use client"

import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { DeliveryOrderForm } from "../components/delivery-order-form"
import { DeliveryOrder, DeliveryOrderItem } from "@/lib/db/schema"
import { type DeliveryOrderFormValues } from "@/lib/schema/deliveryOrderSchema"

export default function CreateDeliveryOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: doID } = React.use(params);
  const [deliveryOrder, setDeliveryOrder] = useState<Partial<(DeliveryOrder & { items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string })[] })>>({});



  const handleSave = async (deliveryOrder: DeliveryOrderFormValues) => {
    console.log("🚀 ~ handleSave ~ deliveryOrder:", deliveryOrder)
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



  const fetchDetail = async (companyID: string) => {
    const detailDO = await fetch("/api/delivery-order/" + companyID).then((res) =>
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

