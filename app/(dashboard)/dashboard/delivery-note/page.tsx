"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import {
  DeliveryNoteList,
  DeliveryNoteListType,
} from "./components/delivery-note-list"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import Link from "next/link"
import { generateDeliveryOrderPDF } from "@/lib/generate/letter-do"

export default function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryNoteListType[]>(
    []
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)


  const handleDownloadDO = async (id: string, callback: () => void) => {
    const detailDO = await fetch("/api/delivery-note/" + id).then((res) =>
      res.json()
    )

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const pdfBlob = generateDeliveryOrderPDF(detailDO)
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');

    if (callback) {
      callback()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/delivery-note?id=${id}`, { method: "DELETE" })
      const updatedDeliveryOrders = await fetch("/api/delivery-note").then(
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
      const deliveryOrdersResponse = await fetch("/api/delivery-note")
      const deliveryOrdersData: DeliveryNoteListType[] =
        await deliveryOrdersResponse.json()
      setDeliveryOrders(deliveryOrdersData)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Delivery Notes</h1>
        <Link href="/dashboard/delivery-note/create" passHref>
          <Button>Create Delivery Notes</Button>
        </Link>
      </header>
      {deleteId !== null && (
        <ConfirmationDialog
          open={deleteId !== null}
          title="Confirm Deletion"
          description="Are you sure you want to delete this delivery note?"
          onConfirm={() => handleDelete(deleteId)}
          confirmLabel="Delete"
          onCancel={() => setDeleteId(null)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <DeliveryNoteList
        deliveryOrders={deliveryOrders}
        handleDownloadDO={handleDownloadDO}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
