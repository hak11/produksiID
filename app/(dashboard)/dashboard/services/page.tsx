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
import { Service } from "@/lib/db/schema"
import { ServiceForm } from "./components/service-form"
import { ServiceList } from "./components/service-list"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Partial<Service> | null>(
    null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    }
    fetchServices()
  }, [])

  const handleSave = async (service: Partial<Service>) => {
    try {
      const isUpdate = selectedService && selectedService.id
      const url = isUpdate ? `/api/services/${selectedService.id}` : "/api/services"
      const method = isUpdate ? "PUT" : "POST"
      const message = isUpdate
        ? "Data successfully saved"
        : "Data successfully created"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} service: ${
            response.statusText
          }`
        )
      }

      toast.success(message)

      setOpen(false)
      const updatedServices = await fetch('/api/services').then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch services: ${res.statusText}`)
        return res.json()
      })
      setServices(updatedServices)
      setSelectedService(null)
    } catch (error: any) {
      console.error("Error in handleSave:", error)
      toast.error(`Error: ${error.message || "Something went wrong"}`)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/services/detail${id}`, { method: "DELETE" })
      const updatedServices = await fetch("/api/services").then((res) =>
        res.json()
      )
      setServices(updatedServices)
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
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedService(null)}>Add Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Service</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edit the details of the selected service." : ""}
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={selectedService}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
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
                Are you sure you want to delete this service? This action cannot
                be undone.
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
      <ServiceList
        services={services}
        onEdit={(service) => {
          setIsEditing(true)
          setSelectedService(service)
          setOpen(true)
        }}
        onDelete={(id: number) => setDeleteId(id)}
      />
    </div>
  )
}
