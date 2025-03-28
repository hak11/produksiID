"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, SaveAll, Download, Loader } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type {
  DeliveryNotes,
} from "@/lib/db/schema"
import {
  deliveryNoteSchema,
  DeliveryNoteFormValues,
  DeliveryNoteItemFormValues,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { generateDeliveryNotePDF } from "@/lib/generate/letter-dn"

interface DeliveryNoteFormProps {
  deliveryNote?: Partial<DeliveryNotes & { dnItems: DeliveryNoteItemFormValues[] }>
  isEdit?: boolean
  onSave: (deliveryNote: DeliveryNoteFormValues, callback?: () => void) => void
  onClose?: () => void
}


export function DeliveryNoteForm({
  deliveryNote,
  isEdit = false,
  onSave,
}: DeliveryNoteFormProps) {
  const { deliveryOrders, isLoading, error } = useDeliveryOrder("pending")
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState<string[]>([])
  const [optionDO, setOptionDO] = useState<{ label: string; value: string }[]>([])
  const [deliveryNoteItems, setDeliveryNoteItems] = useState<DeliveryNoteItemFormValues[]>([])
  const [downloadTrigger, setDownloadTrigger] = useState<boolean | null>(false)
  const [loadingDownload, setLoadingDownload] = useState<boolean | null>(false)
  
  const form = useForm<DeliveryNoteFormValues>({
    resolver: zodResolver(deliveryNoteSchema),
    defaultValues: {
      noteNumber: "",
      issueDate: new Date(),
      status: "draft",
      remarks: "",
      items: [{ deliveryOrderId: undefined, actualQty: 0 }],
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
  console.log("🚀 ~ errors:", errors)

  const handleDownloadDN = async (id: string) => {
    setLoadingDownload(true)
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
      setLoadingDownload(false)
    }
  }

  const generateOrderNoteNumber = useCallback(async () => {
    const response = await fetch("/api/utils/last-orderNote-number")
    const { orderNumber } = await response.json()
    const date = new Date()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)
    const newNumber = parseInt(orderNumber?.slice(5)) + 1 || 1
    const formattedOrderNoteNumber = `DN-${month}${year}${newNumber
      .toString()
      .padStart(4, "0")}`
    form.setValue("noteNumber", formattedOrderNoteNumber)
  }, [form])

  useEffect(() => {
    if (!deliveryOrders) {
      return
    }

    const optionDO = deliveryOrders.map((doItem) => ({
      label: `(${format(new Date(doItem.deliveryDate), "dd MMM yy")}) - ${doItem.orderNumber} - From:${
                      doItem.supplierName } - To:${doItem.customerName}`,
      value: doItem.id,
    }))

    if (!isEdit) {
      generateOrderNoteNumber()
      reset({
        noteNumber: "",
        issueDate: new Date(),
        status: "draft",
        remarks: "",
        items: [{ deliveryOrderId: undefined, actualQty: 0 }],
      })

      setOptionDO(optionDO)

      return
    }
    
    if (isEdit && deliveryNote) {
      setValue("id", deliveryNote.id)
      setValue("noteNumber", deliveryNote.noteNumber || "")
      setValue("issueDate", deliveryNote.issueDate ? new Date(deliveryNote.issueDate) : new Date())
      setValue("status", deliveryNote.status || "draft")
      setValue("remarks", deliveryNote.remarks || "")

      const dataItemMap: DeliveryNoteItemFormValues[] = deliveryNote.dnItems?.map((item) => ({
          name: item.name,
          customerName: item.customerName,
          supplierName: item.supplierName,
          loadQty: item.loadQty,
          deliveryOrderId: item.deliveryOrderId,
          deliveryDate: item.deliveryDate,
          deliveryOrderItemId: item.deliveryOrderItemId,
          doNumber: item.doNumber,
          actualQty: item.actualQty,
        })) || []
      
      setValue("items", dataItemMap)
      setDeliveryNoteItems(dataItemMap)
      
      const aditionalSelectOption = dataItemMap
        .map((item) => ({
          label: `(${format(item.deliveryDate ? new Date(item.deliveryDate) : new Date(), "dd MMM yy")}) - ${item.doNumber} - From:${item.supplierName} - To:${item.customerName}`,
          value: item.deliveryOrderId,
        }))
        .filter(
          (option, index, self) =>
            index === self.findIndex((o) => o.value === option.value)
        );
      
      const unionOptions = [
          ...new Map(
            [...aditionalSelectOption, ...optionDO].map((option) => [
              option.value,
              option,
            ])
          ).values(),
        ];
      
      setOptionDO(unionOptions)
      
      const doNumbers: string[] = [ ...new Set(dataItemMap.map(item => item.deliveryOrderId))]
      setSelectedDeliveryOrders(doNumbers)
    }

  }, [isEdit, deliveryOrders, deliveryNote, reset, generateOrderNoteNumber, setValue])

  const submitForm = (formData: any) => {
    try {
      onSave(formData)
    } catch (error) {
      console.log("🚀 ~ submitForm ~ error:", error)
    }
  }
  
  const multipleSelectDOHandler = async (doNumber: string[]) => {
    if (doNumber.length > 0) {
      const response = await fetch("/api/delivery-order/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doNumber: doNumber }),
      })

      const dataDetails = await response.json()

      const dataItems: DeliveryNoteItemFormValues[] = dataDetails.flatMap(
        (deliveryOrder: any) => {
          return deliveryOrder.items.map((item: any) => ({
            name: item.name ? `${item.name}` : item.itemName,
            supplierName: deliveryOrder.supplier.name,
            customerName: deliveryOrder.customer.name,
            loadQty: item.loadQty,
            doNumber: deliveryOrder.orderNumber,
            actualQty: item.actualQty,
            deliveryOrderId: deliveryOrder.id,
            deliveryOrderItemId: item.id,
          }))
        }
      )

      setValue("items", dataItems)
      setDeliveryNoteItems(dataItems)
      setSelectedDeliveryOrders(doNumber)
    } else {
      setDeliveryNoteItems([])
      setSelectedDeliveryOrders([])
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
        <div className="grid grid-cols-3 gap-4">
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
                          ? format(field.value, "PPP")
                          : "Select Date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? field.value : undefined}
                      onSelect={(date) => field.onChange(date)}
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
                <Select
                  onValueChange={field.onChange}
                  disabled={!isEdit}
                  value={field.value}
                >
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
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormField
              control={control}
              name="remarks"
              render={() => (
                <FormItem>
                  <FormLabel>Delivery Orders (Status Pending)</FormLabel>
                  <MultiSelect
                    options={optionDO}
                    value={selectedDeliveryOrders}
                    onValueChange={multipleSelectDOHandler}
                    placeholder="Select Delivery Orders"
                    animation={500}
                    disabled={isEdit && getValues("status") !== "draft"}
                    variant="inverted"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>DO Number</TableHead>
              <TableHead>Qty Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryNoteItems.map((deliveryNoteItem, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{deliveryNoteItem.name}</TableCell>
                  <TableCell>{deliveryNoteItem.supplierName}</TableCell>
                  <TableCell>{deliveryNoteItem.customerName}</TableCell>
                  <TableCell>{deliveryNoteItem.loadQty}</TableCell>
                  <TableCell>{deliveryNoteItem.doNumber}</TableCell>
                  <TableCell>
                    {isEdit ? deliveryNoteItem.actualQty : "-"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes / Remark</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit">
            <SaveAll className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Create"}{" "}
            Delivery Note
          </Button>
          <Button
            type="button"
            variant={"outline"}
            disabled={!loadingDownload ? !isEdit : true}
            onClick={() => setDownloadTrigger(true)}
          >
            {loadingDownload ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <div className="flex">
                <Download className="mr-2 h-4 w-4" />
              </div>
            )}
             Download
          </Button>
        </div>
      </form>
      {downloadTrigger && (
        <ConfirmationDialog
          open={downloadTrigger}
          title="Confirm Download"
          description="This DN will change status to print after you click download, are you sure for?"
          onConfirm={() => handleDownloadDN(getValues("id")!)}
          confirmLabel="Download DN"
          onCancel={() => setDownloadTrigger(false)}
          onOpenChange={(open) => {
            if (!open) setDownloadTrigger(false)
          }}
        />
      )}
    </Form>
  )
}
