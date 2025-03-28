"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Company as CompanyType } from "@/lib/db/schema"
import { roleEnum } from "@/lib/db/schema"

const availableRoles = ["supplier", "customer"]

export function CompanyForm({
  company,
  onSave,
  onClose,
}: {
  company: Partial<CompanyType & { companyRoles: string[] }> | null
  onSave: (company: Partial<CompanyType>, roles: string[]) => any
  onClose: () => void
}) {
  const roles = roleEnum.enumValues
  const [formData, setFormData] = useState<
    Partial<CompanyType & { roles: string[] }>
  >({
    name: "",
    address: "",
    picName: "",
    picPhone: "",
    email: "",
    registeredDate: "",
  })

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  useEffect(() => {
    if (company) {
      setFormData(company)
      setSelectedRoles(company.companyRoles || [])
    } else {
      setSelectedRoles(roles || [])
    }
  }, [company, roles])

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value })
    }
  

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      setFormData({ ...formData, registeredDate: formattedDate })
    }
  }

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role))
    } else {
      setSelectedRoles((prev) => [...prev, role])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, selectedRoles)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="name"
        placeholder="Company Name"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="picName"
        placeholder="PIC Name"
        value={formData.picName || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="picPhone"
        placeholder="PIC Phone"
        value={formData.picPhone || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="email"
        placeholder="Email"
        type="email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData.registeredDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.registeredDate
              ? new Date(formData.registeredDate).toLocaleDateString()
              : "Pilih Tanggal Registration"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            captionLayout="dropdown-buttons"
            selected={
              formData.registeredDate
                ? new Date(formData.registeredDate)
                : undefined
            }
            onSelect={(date) => handleDateChange(date ?? null)}
            fromYear={1960}
            toYear={2030}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Textarea
        name="address"
        placeholder="Delivery Address"
        value={formData.address || ""}
        onChange={handleChange}
        required
      />
      <div>
        <h3 className="text-lg font-bold">Roles</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          {availableRoles.map((role) => (
            <div key={role}>
              <Checkbox
                id={role}
                checked={selectedRoles.includes(role)}
                onCheckedChange={() => toggleRole(role)}
              />
              <label htmlFor={role} className="ml-2">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
