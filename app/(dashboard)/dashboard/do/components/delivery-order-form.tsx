"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeliveryOrder, Company, Car, DeliveryOrderItem } from "@/lib/db/schema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeliveryOrderForm({
  deliveryOrder,
  onSave,
  onClose,
}: {
  deliveryOrder?: Partial<DeliveryOrder & { items: DeliveryOrderItem[] }>
  onSave: (
    deliveryOrder: Partial<DeliveryOrder & { items: DeliveryOrderItem[] }>
  ) => void
  onClose?: () => void
}) {
  const [formData, setFormData] = useState<
    Partial<DeliveryOrder & { items: any }>
  >({
    supplierId: undefined,
    customerId: undefined,
    carId: undefined,
    orderDate: "",
    deliveryDate: "",
    deliveryStatus: "pending",
    orderNumber: "",
    deliveryAddress: "",
    deliveryAddressAttachment: "",
    items: [],
  })
  const [suppliers, setSuppliers] = useState<Company[]>([])
  const [customers, setCustomers] = useState<Company[]>([])
  const [cars, setCars] = useState<Car[]>([])

  useEffect(() => {
    if (deliveryOrder) {
      setFormData(deliveryOrder)
    }
    fetchCompanies()
    fetchCars()
    generateOrderNumber()
  }, [deliveryOrder])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/company")
      const companies = await response.json()
      setSuppliers(
        companies.filter((c: (Company & { companyRoles: string[] })) => c.companyRoles.includes("supplier"))
      )
      setCustomers(
        companies.filter((c: Company & { companyRoles: string[] }) =>
          c.companyRoles.includes("customer")
        )
      )
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    }
  }

  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars")
      const carsData = await response.json()
      setCars(carsData)
    } catch (error) {
      console.error("Failed to fetch cars:", error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (
    date: Date | null,
    field: "orderDate" | "deliveryDate"
  ) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      setFormData({ ...formData, [field]: formattedDate })
    }
  }

   const generateOrderNumber = async () => {
     try {
       const response = await fetch("/api/utils/last-order-number")
       const { lastOrderNumber } = await response.json()

       const newNumber = parseInt(lastOrderNumber?.slice(1)) + 1 || 1

       const formattedOrderNumber = `K${newNumber.toString().padStart(4, "0")}`

       setFormData((prev) => ({ ...prev, orderNumber: formattedOrderNumber }))
     } catch (error) {
       console.error("Failed to generate order number:", error)
     }
   }

  const handleItemChange = (
    index: number,
    field: keyof DeliveryOrderItem,
    value: any
  ) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    if (field === "loadQty" || field === "loadPerPrice") {
      const qty = parseFloat(updatedItems[index].loadQty as string) || 0
      const price = parseFloat(updatedItems[index].loadPerPrice as string) || 0
      updatedItems[index].totalLoadPrice = (qty * price).toString()
    }
    setFormData({ ...formData, items: updatedItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          loadQty: "0",
          loadPerPrice: "0",
          totalLoadPrice: "0",
        },
      ],
    })
  }

  const removeItem = (index: number) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems.splice(index, 1)
    setFormData({ ...formData, items: updatedItems })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 lg:w-2/4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">DO Number : </div>
          <Input
            name="orderNumber"
            placeholder="Order Number"
            value={formData.orderNumber}
            onChange={handleChange}
            readOnly
            required
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">Order Date : </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.orderDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.orderDate
                  ? format(new Date(formData.orderDate), "PPP")
                  : "Select Order Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.orderDate ? new Date(formData.orderDate) : undefined
                }
                onSelect={(date) => handleDateChange(date ?? null, "orderDate")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">Supplier : </div>
          <Select
            name="supplierId"
            onValueChange={(value) =>
              setFormData({ ...formData, supplierId: Number(value) })
            }
            value={formData.supplierId?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">Customer : </div>
          <Select
            name="customerId"
            onValueChange={(value) =>
              setFormData({ ...formData, customerId: Number(value) })
            }
            value={formData.customerId?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">Kendaraan : </div>
          <Select
            name="carId"
            onValueChange={(value) =>
              setFormData({ ...formData, carId: Number(value) })
            }
            value={formData.carId?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Car" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((car) => (
                <SelectItem key={car.id} value={car.id.toString()}>
                  {car.brand} {car.model} - {car.licensePlate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">
            Delivery Date :{" "}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.deliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deliveryDate
                  ? format(new Date(formData.deliveryDate), "PPP")
                  : "Select Delivery Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.deliveryDate
                    ? new Date(formData.deliveryDate)
                    : undefined
                }
                onSelect={(date) =>
                  handleDateChange(date ?? null, "deliveryDate")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {deliveryOrder?.id && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">
              Delivery Status
            </div>
            <Select
              name="deliveryStatus"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  deliveryStatus: value as DeliveryOrder["deliveryStatus"],
                })
              }
              value={formData.deliveryStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Delivery Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* <Textarea
          name="deliveryAddress"
          placeholder="Delivery Address"
          value={formData.deliveryAddress}
          onChange={handleChange}
          required
        /> */}

        {/* <Input
        name="deliveryAddressAttachment"
        placeholder="Delivery Address Attachment URL"
        value={formData.deliveryAddressAttachment}
        onChange={handleChange}
      /> */}
      </div>

      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold">Delivery Order Items</h3>
        {formData.items?.map((item: any, index: number) => (
          <div key={index} className="flex space-x-2">
            <Input
              type="number"
              placeholder="Load Quantity"
              value={item.loadQty}
              onChange={(e) =>
                handleItemChange(index, "loadQty", e.target.value)
              }
              required
            />
            <Input
              type="number"
              placeholder="Actual Load Quantity"
              value={item.loadQtyActual}
              disabled
              onChange={(e) =>
                handleItemChange(index, "loadQtyActual", e.target.value)
              }
            />
            <Input
              type="number"
              placeholder="Load Per Price"
              value={item.loadPerPrice}
              onChange={(e) =>
                handleItemChange(index, "loadPerPrice", e.target.value)
              }
              required
            />
            <Input
              type="number"
              placeholder="Total Load Price"
              value={item.totalLoadPrice}
              readOnly
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeItem(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
        )}
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
