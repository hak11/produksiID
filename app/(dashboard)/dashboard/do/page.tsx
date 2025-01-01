"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
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
import {
  DeliveryOrderList,
  DeliveryOrderListType,
} from "./components/delivery-order-list"
import Link from "next/link"
// import { generateDeliveryOrderPDF } from "@/lib/generate/letter-do"


export default function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrderListType[]>(
    []
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)


  const handleDownloadDO = async (id: number, callback: () => void) => {
    const detailDO = await fetch("/api/delivery-order/" + id).then((res) =>
      res.json()
    )

    console.log("🚀 ~ handleDownloadDO ~ detailDO:", detailDO)

    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // const pdfBlob = generateDeliveryOrderPDF(detailDO)
    // const blobUrl = URL.createObjectURL(pdfBlob);
    // window.open(blobUrl, '_blank');


    if (callback) {
      callback()
    }
  
    // const link = document.createElement('a')
    // link.href = URL.createObjectURL(pdfBlob)
    // link.download = `delivery-order-${formData.orderNumber}.pdf`
    // link.click()
  }

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
      <DeliveryOrderList
        deliveryOrders={deliveryOrders}
        handleDownloadDO={handleDownloadDO}
        onDelete={(id: number) => setDeleteId(id)}
      />
    </div>
  )
}
