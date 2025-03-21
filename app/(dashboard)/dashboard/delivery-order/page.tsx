"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import {
  DeliveryOrderList,
  DeliveryOrderListType,
} from "./components/delivery-order-list"
import Link from "next/link"

export default function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrderListType[]>(
    []
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/delivery-order?id=${id}`, { method: "DELETE" })
      const updatedDeliveryOrders = await fetch("/api/delivery-order").then(
        (res) => res.json()
      )
      setDeliveryOrders(updatedDeliveryOrders)
      toast.success("Delivery order successfully deleted")
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while deleting the delivery order")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const deliveryOrdersResponse = await fetch("/api/delivery-order")
      const deliveryOrdersData: DeliveryOrderListType[] =
        await deliveryOrdersResponse.json()
      setDeliveryOrders(deliveryOrdersData)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Delivery Orders</h1>
        <Link href="/dashboard/delivery-order/create" passHref>
          <Button>Create Delivery Order</Button>
        </Link>
      </header>
      {deleteId !== null && (
        <ConfirmationDialog
          open={deleteId !== null}
          title="Confirm Deletion"
          description="Are you sure you want to delete this delivery order?"
          onConfirm={() => handleDelete(deleteId)}
          confirmLabel="Delete"
          onCancel={() => setDeleteId(null)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <DeliveryOrderList
        deliveryOrders={deliveryOrders}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
