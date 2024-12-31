"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { DeliveryOrder } from "@/lib/db/schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DeliveryOrderForm } from "./components/delivery-order-form"
import {
  DeliveryOrderList,
  DeliveryOrderListType,
} from "./components/delivery-order-list"
import Link from "next/link"

export default function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrderListType[]>(
    []
  )
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] =
    useState<Partial<DeliveryOrder> | null>({})
  const [isEditing, setIsEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
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

  const handleEdit = async (deliveryOrderId: number) => {
    const detailDeliveryOrder = await fetch(
      "/api/delivery-order/" + deliveryOrderId
    ).then((res) => res.json())

    setSelectedDeliveryOrder(detailDeliveryOrder)
    setIsEditing(true)
    setOpen(true)
  }

  const handleSave = async (deliveryOrder: Partial<DeliveryOrder>) => {
    try {
      const isUpdate = deliveryOrder.id
      const url = "/api/delivery-order"
      const method = isUpdate ? "PUT" : "POST"
      const message = isUpdate
        ? "Delivery order successfully updated"
        : "Delivery order successfully created"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryOrder),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} delivery order: ${
            response.statusText
          }`
        )
      }

      toast.success(message)

      setOpen(false)
      const updatedDeliveryOrders = await fetch(url).then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch delivery orders: ${res.statusText}`)
        return res.json()
      })
      setDeliveryOrders(updatedDeliveryOrders)
      setSelectedDeliveryOrder(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the delivery order")
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Delivery Orders</h1>
        <Link href="/dashboard/do/create" passHref>
          <Button>Create Delivery Order</Button>
        </Link>
      </header>
      {deleteId !== null && (
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this delivery order? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(deleteId)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Delivery Order
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edit the details of the selected delivery order."
                : "Fill in the details of the new delivery order."}
            </DialogDescription>
          </DialogHeader>
          <DeliveryOrderForm
            deliveryOrder={selectedDeliveryOrder || ({} as DeliveryOrder)}
            onSave={handleSave}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <DeliveryOrderList
        deliveryOrders={deliveryOrders}
        onEdit={(deliveryOrderId: number) => handleEdit(deliveryOrderId)}
        onDelete={(id: number) => setDeleteId(id)}
      />
    </div>
  )
}
