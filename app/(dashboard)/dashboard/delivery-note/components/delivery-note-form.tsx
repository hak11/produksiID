"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, SaveAll, Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeliveryNotes, DeliveryNoteItems } from "@/lib/db/schema"
import {
  deliveryNoteSchema,
  type DeliveryNoteFormValues,
} from "@/lib/validatorSchema/deliveryNoteSchema"
import { useDeliveryOrder } from "@/hooks/useDeliveryOrder"
import { MultiSelect } from "@/components/multi-select"
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
import {
  invoiceSchema,
  InvoicesFormValues,
  DoInvoiceItemFormValues,
  DoInvoiceFormValues,
} from "@/lib/validatorSchema/invoicesSchema"

interface DeliveryNoteFormProps {
  deliveryNote?: Partial<DeliveryNotes & { items: DeliveryNoteItems[] }>
  isEdit?: boolean
  onSave: (deliveryNote: DeliveryNoteFormValues, callback?: () => void) => void
  onClose?: () => void
}


export function DeliveryNoteForm({
  deliveryNote,
  isEdit = false,
  onSave,
  // onClose,
}: DeliveryNoteFormProps) {
  const { deliveryOrders, isLoading, error } = useDeliveryOrder()
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState<string[]>([])
  
  console.log("🚀 ~ deliveryOrders:", deliveryOrders)

  const multipleSelectDOHandler = async (doNumber: string[]) => {
    const response = await fetch("/api/delivery-order/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doNumber: doNumber }),
    })

    const dataDetails = await response.json()

    const dataItems: DoInvoiceItemFormValues[] = dataDetails.flatMap(
      (deliveryOrder: any) => {
        return deliveryOrder.items.map((item: any) => ({
          loadQty: item.loadQty,
          loadPerPrice: item.loadPerPrice,
          totalLoadPrice: item.totalLoadPrice,
          deliveryOrderId: deliveryOrder.id,
          loadQtyActual: item.loadQtyActual,
          orderNumber: deliveryOrder.orderNumber,
          supplierName: deliveryOrder.supplier.name,
          customerName: deliveryOrder.customer.name,
        }))
      }
    )

    setSelectedDeliveryOrders(doNumber)
  }

  const form = useForm<DeliveryNoteFormValues>({
    resolver: zodResolver(deliveryNoteSchema),
    defaultValues: {
      noteNumber: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      status: "draft",
      remarks: "",
      items: [{ deliveryOrderId: undefined, actualQty: "0" }],
    },
  })

  const {
    control,
    setValue,
    reset,
    // getValues,
    handleSubmit,
    // formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "items",
  })

  useEffect(() => {
    if (isEdit && deliveryNote) {
      setValue("noteNumber", deliveryNote.noteNumber || "")
      setValue("issueDate", deliveryNote.issueDate || "")
      setValue("status", deliveryNote.status || "draft")
      setValue("remarks", deliveryNote.remarks || "")
      // setValue("items", deliveryNote.items || [])
    } else {
      reset({
        noteNumber: "",
        issueDate: format(new Date(), "yyyy-MM-dd"),
        status: "draft",
        remarks: "",
        items: [{ deliveryOrderId: undefined, actualQty: "0" }],
      })
    }
  }, [isEdit, deliveryNote, reset, setValue])

  const submitForm = (formData: any) => {
    try {
      onSave(formData, () => {
        window.location.reload()
      })
    } catch (error) {
      console.log("🚀 ~ submitForm ~ error:", error)
    }
  }

  if (isLoading)
    return (
      <div>
        <Loader className="animate-spin" size={16} /> Loading...
      </div>
    )
  if (error) return <div>Error: {error}</div>

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-8">
        <div className="space-y-4 w-1/3 border-2 border-gray-200 p-4 rounded-lg">
          <FormField
            control={control}
            name="noteNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No Surat Jalan / Delivery Note Number</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
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
                          : "Select Date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="printed">Printed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <MultiSelect
            options={[]}
            onValueChange={multipleSelectDOHandler}
            defaultValue={selectedDeliveryOrders}
            placeholder="Select Delivery Orders"
            animation={500}
            variant="inverted"
          />
          <div className="mt-4 flex">
            <h2 className="text-xl font-semibold">Selected Delivery Orders:</h2>
            <span className="flex gap-4 ml-4 items-center">
              {selectedDeliveryOrders.map((dataValue) => (
                <span key={dataValue}>{dataValue}</span>
              ))}
            </span>
          </div>

          <Button type="submit">
            <SaveAll className="mr-2 h-4 w-4" /> Save Delivery Note
          </Button>
        </div>
      </form>
    </Form>
  )
}
