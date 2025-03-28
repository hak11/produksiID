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
import type { Company as CompanyType } from "@/lib/db/schema"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { CompanyForm } from "./components/company-form"
import { CompanyList, CompanyListType } from "./components/company-list"


export default function CompanysPage() {
  const [companies, setCompanys] = useState<CompanyListType[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Partial<CompanyType> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/company?id=${id}`, { method: "DELETE" })
      const updatedCompanys = await fetch("/api/company").then((res) =>
        res.json()
      )
      setCompanys(updatedCompanys)
      toast.success("Data successfully deleted")
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the company")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const companiesResponse = await fetch("/api/company")

      const companiesWithDrivers: CompanyListType[] =
      await companiesResponse.json()

      setCompanys(companiesWithDrivers)
    }

    fetchData()
  }, [])

  const handleEdit = async (companyID: number) => {
    const detailCompany = await fetch("/api/company/" + companyID).then((res) =>
      res.json()
    )

    setSelectedCompany(detailCompany)
    setIsEditing(true)
    setOpen(true)
  }

  const handleSave = async (
    company: Partial<CompanyType>,
    roles: string[]
  ) => {
    try {
      const isUpdate = company.id
      const url = "/api/company"
      const method = isUpdate ? "PUT" : "POST"
      const message = isUpdate
        ? "Data successfully saved"
        : "Data successfully created"


      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, roles }),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} company: ${
            response.statusText
          }`
        )
      }

      toast.success(message)

      setOpen(false)
      const updatedCompanys = await fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch companies: ${res.statusText}`)
        return res.json()
      })
      setCompanys(updatedCompanys)
      setSelectedCompany(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the company")
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Companies</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCompany(null)}>
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Company</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Edit the details of the selected company."
                  : "Fill in the details of the new company."}
              </DialogDescription>
            </DialogHeader>
            <CompanyForm
              company={selectedCompany}
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
          description="Are you sure you want to delete this company?"
          onConfirm={() => handleDelete(deleteId)}
          confirmLabel="Delete"
          onCancel={() => setDeleteId(null)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <CompanyList
        companies={companies}
        onEdit={(companyID: number) => handleEdit(companyID)}
        onDelete={(id: number) => setDeleteId(id)}
      />
    </div>
  )
}
