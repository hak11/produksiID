"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash, SaveAll, Loader } from 'lucide-react'
import { cn } from "@/lib/utils"
import { DeliveryOrder, DeliveryOrderItem } from "@/lib/db/schema"
import { deliveryOrderSchema, type DeliveryOrderFormValues } from "@/lib/validatorSchema/deliveryOrderSchema"
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
import { formatCurrency } from "@/lib/utils"

interface DeliveryOrderFormProps {
  deliveryOrder?: Partial<DeliveryOrder & { items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string })[], deliveryDrivers: { main: string | null, assistant: string | null } }>
  isEdit?: boolean
  onSave: (deliveryOrder: DeliveryOrderFormValues, callback?: () => void) => void
  onClose?: () => void
}

export function DeliveryOrderForm({
  deliveryOrder,
  isEdit = false,
  onSave,
  onClose,
}: DeliveryOrderFormProps) {
  const { suppliers, customers, cars, drivers, isLoading, items, error } = useDeliveryData()
  
  const form =
    useForm<DeliveryOrderFormValues>({
      resolver: zodResolver(deliveryOrderSchema),
      defaultValues: {
        orderNumber: "",
        supplierId: undefined,
        customerId: undefined,
        carId: undefined,
        orderDate: new Date().toString(),
        deliveryDate: "",
        deliveryStatus: "pending",
        deliveryAddress: "",
        deliveryDrivers: {
          main: undefined,
          assistant: undefined,
        },
        items: [
          {
            id: undefined,
            loadQty: "1",
            loadPerPrice: "0",
            totalLoadPrice: "0",
            loadPerPriceStr: "Rp 0",
            totalLoadPriceStr: "Rp 0",
            itemId: undefined
          },
        ],
      },
    })

  const {
    control,
    setValue,
    reset,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "items"
  })

  console.log(errors)

  useEffect(() => {
    if (isEdit && deliveryOrder) {
      if (deliveryOrder.items && deliveryOrder.items.length > 0) {
        const updatedItems = (deliveryOrder.items || []).map((item) => ({
          ...item,
          loadPerPriceStr: formatCurrency(item.loadPerPrice) || "Rp 0",
          totalLoadPriceStr: formatCurrency(item.totalLoadPrice) || "Rp 0",
        }));

        deliveryOrder.items = updatedItems || []
        console.log("🚀 ~ useEffect ~ deliveryOrder:", deliveryOrder)
      }

      setValue("orderNumber", deliveryOrder.orderNumber || "")
      setValue("supplierId", deliveryOrder.supplierId || "")
      setValue("customerId", deliveryOrder.customerId || "")
      setValue("carId", deliveryOrder.carId || "")
      setValue("orderDate", deliveryOrder.orderDate || "")
      setValue("deliveryDate", deliveryOrder.deliveryDate || "")
      setValue("deliveryStatus", deliveryOrder.deliveryStatus || "pending")
      setValue("deliveryAddress", deliveryOrder.deliveryAddress || "")
      setValue("items", deliveryOrder.items || [])
      setValue("deliveryDrivers.main", deliveryOrder.deliveryDrivers?.main || "")
      setValue("deliveryDrivers.assistant", deliveryOrder.deliveryDrivers?.assistant || "")
    } else {
      reset({
        orderNumber: "",
        supplierId: undefined,
        customerId: undefined,
        carId: undefined,
        orderDate: format(new Date(), "yyyy-MM-dd"),
        deliveryDate: "",
        deliveryStatus: "pending",
        deliveryAddress: "",
        deliveryDrivers: {
          main: undefined,
          assistant: undefined,
        },
        items: [
          {
            id: undefined,
            loadQty: "1",
            loadPerPrice: "0",
            totalLoadPrice: "0",
            loadPerPriceStr: "Rp 0",
            totalLoadPriceStr: "Rp 0",
            itemId: undefined,
          },
        ],
      })
    }
  }, [isEdit, deliveryOrder, reset, setValue])

  const handleItemChange = (index: number, field: keyof (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string }), value: string) => {
    if (field === "loadQty" || field === "loadPerPrice") {
      const numericValue = value.replace(/[^\d]/g, "")
      
      if (field === "loadQty") {
        setValue(`items.${index}.loadQty`, numericValue)
      } else {
        setValue(`items.${index}.loadPerPrice`, numericValue)
        const formattedValue = formatCurrency(numericValue) || "Rp 0"
        setValue(`items.${index}.loadPerPriceStr`, formattedValue)
      }

      const qty = parseFloat(getValues(`items.${index}.loadQty`)) || 0
      const price = parseFloat(getValues(`items.${index}.loadPerPrice`)) || 0
      const total = (qty * price).toString()

      setValue(`items.${index}.totalLoadPrice`, total)
      setValue(`items.${index}.totalLoadPriceStr`, formatCurrency(total))
    }

    if (field === "itemId") {
      setValue(`items.${index}.itemId`, value)
      const getPriceFromItems =
        items.find((item) => item.id === value)?.price || "0"
      handleItemChange(index, "loadPerPrice", getPriceFromItems)
    }
  }

  const submitForm = (formData: any) => {
    try {
      onSave(formData, () => {
        window.location.reload()
      })
    } catch (error) {
      console.log("🚀 ~ submitForm ~ error:", error)
    }
  }

  if (isLoading) return <div><Loader className="animate-spin" size={16} /> Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-8">
        <div className="flex gap-4">
          <div className="space-y-4 w-1/3 border-2 border-gray-200 p-4 rounded-lg">
            <FormField
              control={control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DO Number</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
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
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pilih Tanggal Order"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
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
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pilih Tanggal Kirim"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      const getSupplierName = suppliers.find(
                        (supplier) => supplier.id === value
                      )?.name
                      setValue("supplierName", getSupplierName || "")
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
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
              control={control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer (Tujuan)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      const getCustomerName = customers.find(
                        (customer) => customer.id === value
                      )?.name
                      setValue("customerName", getCustomerName || "")
                      const getCustomerAddress = customers.find(
                        (customer) => customer.id === value
                      )?.address
                      setValue("deliveryAddress", getCustomerAddress || "")
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
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
              control={control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kendaran</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kendaraan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
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
              control={control}
              name="deliveryStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Delivery</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      setValue(
                        "deliveryStatus",
                        value as DeliveryOrder["deliveryStatus"]
                      )
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
              control={control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Pengiriman</FormLabel>
                  <FormControl>
                    <Textarea {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2 rounded-lg flex-1 border-2 border-gray-200 p-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <FormField
                    control={control}
                    name="deliveryDrivers.main"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Driver (Utama)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Driver - Main" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={control}
                    name="deliveryDrivers.assistant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Driver (assistant)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Driver - Ass" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-2 rounded-lg flex-1 border-2 border-gray-200 p-4">
              <table className="min-w-full divide-y divide-gray-200 -mt-1.5">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Per Price (Rp)
                    </th>
                    <th
                      colSpan={2}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Load Price (Rp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-4 py-4">
                        <FormField
                          control={control}
                          name={`items.${index}.itemId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  handleItemChange(index, "itemId", value)
                                }}
                                value={
                                  field.value
                                    ? field.value?.toString()
                                    : undefined
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Pilih Layanan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {items.map((item) => (
                                    <SelectItem
                                      key={item.id}
                                      value={item.id.toString()}
                                    >
                                      {item.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <FormField
                          control={control}
                          name={`items.${index}.loadQty`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value}
                                  className="w-24"
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "loadQty",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <FormField
                          control={control}
                          name={`items.${index}.loadPerPriceStr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="w-36"
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "loadPerPrice",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <FormField
                          control={control}
                          name={`items.${index}.totalLoadPriceStr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="w-48" readOnly />
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
                onClick={() =>
                  append({
                    id: "",
                    loadQty: "0",
                    loadPerPrice: "0",
                    totalLoadPrice: "0",
                    loadPerPriceStr: "Rp 0",
                    totalLoadPriceStr: "Rp 0",
                    itemId: "",
                  })
                }
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

