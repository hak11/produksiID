"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash, SaveAll } from 'lucide-react'
import { cn } from "@/lib/utils"
import { DeliveryOrder, DeliveryOrderItem } from "@/lib/db/schema"
import { deliveryOrderSchema, type DeliveryOrderFormValues } from "@/lib/schema/deliveryOrderSchema"
import { useDeliveryData } from "@/hooks/use-delivery-data"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const formatCurrency = (value: string) => {
  const number = parseFloat(value.replace(/[^\d]/g, "")) || 0
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number)
}

interface DeliveryOrderFormProps {
  deliveryOrder?: Partial<DeliveryOrder & { items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string })[] }>
  isEdit?: boolean
  onSave: (deliveryOrder: DeliveryOrderFormValues) => void
  onClose?: () => void
}

export function DeliveryOrderForm({
  deliveryOrder,
  isEdit = false,
  onSave,
  onClose,
}: DeliveryOrderFormProps) {
  const { suppliers, customers, cars, isLoading, error } = useDeliveryData()
  
  const form = useForm<DeliveryOrderFormValues>({
    resolver: zodResolver(deliveryOrderSchema),
    defaultValues: {
      orderNumber: "",
      supplierId: undefined,
      customerId: undefined,
      carId: undefined,
      orderDate: "",
      deliveryDate: "",
      deliveryStatus: "pending",
      deliveryAddress: "",
      items: [
        {
          loadQty: "0",
          loadPerPrice: "0",
          totalLoadPrice: "0",
          loadPerPriceStr: "Rp 0",
          totalLoadPriceStr: "Rp 0"
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  useEffect(() => {
    if (isEdit && deliveryOrder) {
      if (deliveryOrder.items && deliveryOrder.items.length > 0) {
        const updatedItems = (deliveryOrder.items || []).map((item) => ({
          ...item,
          loadPerPriceStr: formatCurrency(item.loadPerPrice) || "Rp 0",
          totalLoadPriceStr: formatCurrency(item.totalLoadPrice) || "Rp 0",
        }));

        deliveryOrder.items = updatedItems || []
      }

      form.setValue("orderNumber", deliveryOrder.orderNumber || "")
      form.setValue("supplierId", deliveryOrder.supplierId || 0)
      form.setValue("customerId", deliveryOrder.customerId || 0)
      form.setValue("carId", deliveryOrder.carId || 0)
      form.setValue("orderDate", deliveryOrder.orderDate || "")
      form.setValue("deliveryDate", deliveryOrder.deliveryDate || "")
      form.setValue("deliveryStatus", deliveryOrder.deliveryStatus || "pending")
      form.setValue("deliveryAddress", deliveryOrder.deliveryAddress || "")
      form.setValue("items", deliveryOrder.items || [])
    } else {
      generateOrderNumber()
      form.reset({
      orderNumber: "",
      supplierId: undefined,
      customerId: undefined,
      carId: undefined,
      orderDate: "",
      deliveryDate: "",
      deliveryStatus: "pending",
      deliveryAddress: "",
      items: [
          {
            loadQty: "0",
            loadPerPrice: "0",
            totalLoadPrice: "0",
            loadPerPriceStr: "Rp 0",
            totalLoadPriceStr: "Rp 0",
          },
        ],
      });
    }
  }, [isEdit, deliveryOrder, form])

  const generateOrderNumber = async () => {
    try {
      const response = await fetch("/api/utils/last-order-number")
      const { orderNumber } = await response.json()
      const newNumber = parseInt(orderNumber?.slice(1)) + 1 || 1
      const formattedOrderNumber = `K${newNumber.toString().padStart(4, "0")}`
      form.setValue("orderNumber", formattedOrderNumber)
    } catch (error) {
      console.error("Failed to generate order number:", error)
    }
  }

  const handleItemChange = (index: number, field: keyof (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string }), value: string) => {
    if (field === "loadQty" || field === "loadPerPrice") {
      const numericValue = value.replace(/[^\d]/g, "")
      
      if (field === "loadQty") {
        form.setValue(`items.${index}.loadQty`, numericValue)
      } else {
        form.setValue(`items.${index}.loadPerPrice`, numericValue)
        const formattedValue = formatCurrency(numericValue) || "Rp 0"
        form.setValue(`items.${index}.loadPerPriceStr`, formattedValue)
      }

      const qty = parseFloat(form.getValues(`items.${index}.loadQty`)) || 0
      const price = parseFloat(form.getValues(`items.${index}.loadPerPrice`)) || 0
      const total = (qty * price).toString()

      form.setValue(`items.${index}.totalLoadPrice`, total)
      form.setValue(`items.${index}.totalLoadPriceStr`, formatCurrency(total))
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
        <div className="flex gap-4">
          <div className="space-y-4 flex-1 border-2 border-gray-200 p-4 rounded-lg">
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DO Number</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Order</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pilih Tanggal Order"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Kirim</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pilih Tanggal Kirim"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value))
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      console.log("🚀 ~ value:", value)
                      field.onChange(Number(value))
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kendaraan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kendaran</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value))
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kendaraan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.brand} {car.model} - {car.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Delivery</FormLabel>
                  <Select
                    onValueChange={(value) => {
                    console.log("🚀 ~ value:", value)
                      form.setValue("deliveryStatus", value as DeliveryOrder["deliveryStatus"])
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status Pengiriman" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                     <Textarea
                      {...field}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <div className="space-y-2 rounded-lg flex-1 border-2 border-gray-200 p-4">
              <table className="min-w-full divide-y divide-gray-200 -mt-1.5">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Per Price (Rp)
                    </th>
                    <th colSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Load Price (Rp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-6 py-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.loadQty`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) => handleItemChange(index, "loadQty", e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.loadPerPriceStr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) => handleItemChange(index, "loadPerPrice", e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.totalLoadPriceStr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                type="button"
                onClick={() => append({
                  loadQty: "0",
                  loadPerPrice: "0",
                  totalLoadPrice: "0",
                  loadPerPriceStr: "Rp 0",
                  totalLoadPriceStr: "Rp 0"
                })}
                className="ml-6"
              >
                <Plus className="h-4 w-4 mr-2" /> Tambah Item
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
          )}
          <Button type="submit">
            <SaveAll className="mr-2 h-4 w-4" /> Simpan Delivery Order
          </Button>
        </div>
      </form>
    </Form>
  )
}

