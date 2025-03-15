"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { Item } from "@/lib/db/schema"
import { ItemForm } from "./components/item-form"
import { ItemList } from "./components/item-list"

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Partial<Item> | null>(
    null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch("/api/items")
      const data = await response.json()
      setItems(data)
    }
    fetchItems()
  }, [])

  const handleSave = async (item: Partial<Item>) => {
    try {
      const isUpdate = selectedItem && selectedItem.id
      const url = isUpdate ? `/api/items/${selectedItem.id}` : "/api/items"
      const method = isUpdate ? "PUT" : "POST"
      const message = isUpdate
        ? "Data successfully saved"
        : "Data successfully created"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} item: ${
            response.statusText
          }`
        )
      }

      toast.success(message)

      setOpen(false)
      const updatedItems = await fetch('/api/items').then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch items: ${res.statusText}`)
        return res.json()
      })
      setItems(updatedItems)
      setSelectedItem(null)
    } catch (error: any) {
      console.error("Error in handleSave:", error)
      toast.error(`Error: ${error.message || "Something went wrong"}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/items/detail${id}`, { method: "DELETE" })
      const updatedItems = await fetch("/api/items").then((res) =>
        res.json()
      )
      setItems(updatedItems)
      toast.success("Data successfully deleted")
      setDeleteId(null)
    } catch (error: any) {
      console.error("Error in handleDelete:", error)
      toast.error(`Error: ${error.message || "Something went wrong"}`)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Items / Items</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedItem(null)}>Add Data</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Data</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edit the details of the selected item." : ""}
              </DialogDescription>
            </DialogHeader>
            <ItemForm
              item={selectedItem}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      {deleteId !== null && (
        <ConfirmationDialog
          open={deleteId !== null}
          title="Confirm Deletion"
          description="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <ItemList
        items={items}
        onEdit={(item: any) => {
          setIsEditing(true)
          setSelectedItem(item)
          setOpen(true)
        }}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
