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
import { generateDeliveryNotePDF } from "@/lib/generate/letter-dn"

export default function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryNoteListType[]>(
    []
  )

  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [downloadId, setDownloadId] = useState<string | null>(null)


  const handleDownloadDN = async (id: string) => {
    setLoadingIds((prev) => [...prev, id])
    try {
      const detailDN = await fetch("/api/delivery-note/" + id).then((res) =>
        res.json()
      )

      if (!detailDN) {
        throw new Error("Delivery note not found")
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const pdfBlob = generateDeliveryNotePDF(detailDN)
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.log("🚀 ~ handleDownloadDO ~ error:", error)
      setLoadingIds((prev) => prev.filter((i) => i !== id))
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
      {downloadId !== null && (
        <ConfirmationDialog
          open={downloadId !== null}
          title="Confirm Download"
          description="This DN will change status to print after you click download, are you sure for?"
          onConfirm={() => handleDownloadDN(downloadId)}
          confirmLabel="Download DN"
          onCancel={() => setDownloadId(null)}
          onOpenChange={(open) => {
            if (!open) setDownloadId(null)
          }}
        />
      )}
      <DeliveryNoteList
        loadingIds={loadingIds}
        deliveryOrders={deliveryOrders}
        handleDownloadDO={(id: string) => setDownloadId(id)}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
