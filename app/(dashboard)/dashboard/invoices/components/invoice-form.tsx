"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, SaveAll } from 'lucide-react'
import { MultiSelect } from "@/components/multi-select"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import type {
  Invoice,
  Company,
  InvoicesDetailType,
} from "@/lib/db/schema"
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
import {
  invoiceSchema,
  InvoicesFormValues,
  DoInvoiceItemFormValues,
  DoInvoiceFormValues,
} from "@/lib/validatorSchema/invoicesSchema"
import { formatCurrency } from "@/lib/utils"
// import { json } from "stream/consumers"


interface InvoiceFormProps {
  invoice?: Partial<Invoice>
  onSave: (invoice: InvoicesDetailType, callback?: () => void) => void
}

export function InvoiceForm({ invoice, onSave }: InvoiceFormProps) {
  console.log("🚀 ~ invoice:", invoice)
  const [companies, setCompanies] = useState<Company[]>([])
  const [invoiceItems, setInvoiceItems] = useState<DoInvoiceItemFormValues[]>([])
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState<string[]>([])

  const form = useForm<InvoicesFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString(),
      dueDate: "",
      status: "draft",
      totalAmount: "0",
      notes: "",
      companyId: undefined,
      deliveryOrders: [],
      doIds: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deliveryOrders",
  })

  useEffect(() => {
    fetchCompanies()
    generateInvoiceNumber()
  }, [])

  const fetchCompanies = async () => {
    const response = await fetch("/api/company")
    const data = await response.json()
    setCompanies(data)
  }

  const generateInvoiceNumber = async () => {
    const response = await fetch("/api/utils/last-invoice-number")
    const { invoiceNumber } = await response.json()
    const date = new Date()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const newNumber = parseInt(invoiceNumber?.slice(5)) + 1 || 1
    const formattedInvoiceNumber = `I${month}${year}${newNumber.toString().padStart(4, '0')}`
    form.setValue("invoiceNumber", formattedInvoiceNumber)
  }

  const handleCompanyChange = async (companyId: string) => {
    setSelectedDeliveryOrders([])
    remove()
    form.setValue("companyId", companyId)
    const response = await fetch(`/api/delivery-order?companyId=${companyId}`)
    const data = await response.json()
    append(data)
  }

  // const handleDeliveryOrderSelect = (doId: string) => {
    // console.log("🚀 ~ handleDeliveryOrderSelect ~ doId:", doId)
    // const selectedDO = deliveryOrders.find(d => d.id.toString() === doId)
    // if (selectedDO) {
    //   setSelectedDeliveryOrders(prev => [...prev, selectedDO])
    //   append({
    //     deliveryOrderId: selectedDO.id,
    //     amount: calculateTotalPrice(selectedDO)
    //   })
    // }
  // }

  // const calculateTotalPrice = () => {
    // console.log("🚀 ~ calculateTotalPrice ~ deliveryOrder:", deliveryOrder)
    // return deliveryOrder.items.reduce((total: number, item: DeliveryOrderItem) => {
    //   return total + (item.loadQtyActual || item.loadQty) * item.loadPerPrice
    // })
    // return deliveryOrder.items.reduce((total: number, item: DeliveryOrderItem) => {
    //   return total + (item.loadQtyActual || item.loadQty) * item.loadPerPrice
    // }, 0)
  // }

  // const updateTotalAmount = () => {
  //   const total = fields.reduce((sum, field) => sum + field.amount, 0)
  //   form.setValue("totalAmount", total)
  // }

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
          loadPerPriceStr: formatCurrency(item.loadPerPrice),
          totalLoadPriceStr: formatCurrency(item.totalLoadPrice),
          deliveryOrderId: deliveryOrder.id,
          loadQtyActual: item.loadQtyActual,
          orderNumber: deliveryOrder.orderNumber,
          supplierName: deliveryOrder.supplier.name,
          customerName: deliveryOrder.customer.name,
        }))
      }
    )
    

    setInvoiceItems(dataItems)

    setSelectedDeliveryOrders(doNumber)
  }

  useEffect(() => {
    // updateTotalAmount()
  }, [fields])

  const onSubmit = (data: any) => {
    onSave(data)
  }

  // console.log("🚀 ~ invoiceItems:", invoiceItems)


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <Select
                  onValueChange={(value) => handleCompanyChange(value)}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                      >
                        {company.name}
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
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
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
                          : "Select Invoice Date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
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
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
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
                          : "Select Due Date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
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
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <MultiSelect
          options={fields.map((field: DoInvoiceFormValues) => ({
            label: `(${format(new Date(field.deliveryDate), "dd MMM yy")}) - ${
              field.orderNumber
            } - ${field.customerName} - ${field.supplierName}`,
            value: field.orderNumber,
          }))}
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Actual Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Price</TableHead>
              {/* <TableHead>Action</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceItems.map((invoiceItem, index) => {
              // console.log("🚀 ~ {invoiceItems.map ~ invoiceItem:", invoiceItem)
              return (
                <TableRow key={index}>
                  <TableCell>{invoiceItem.orderNumber}</TableCell>
                  <TableCell>{invoiceItem.supplierName}</TableCell>
                  <TableCell>{invoiceItem.customerName}</TableCell>
                  <TableCell>{invoiceItem.loadQty}</TableCell>
                  <TableCell>{invoiceItem.loadQtyActual}</TableCell>
                  <TableCell>{invoiceItem.loadPerPriceStr}</TableCell>
                  <TableCell>{invoiceItem.totalLoadPriceStr}</TableCell>
                  {/* <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell> */}
                </TableRow>
              )
              // const do = selectedDeliveryOrders.find(d => d.id === field.deliveryOrderId)
              // return (
              //   <TableRow key={field.id}>
              //     <TableCell>{do?.orderNumber}</TableCell>
              //     <TableCell>{do?.supplier?.name}</TableCell>
              //     <TableCell>{do?.customer?.name}</TableCell>
              //     <TableCell>{do?.items.reduce((sum, item) => sum + item.loadQty, 0)}</TableCell>
              //     <TableCell>{do?.items.reduce((sum, item) => sum + (item.loadQtyActual || item.loadQty), 0)}</TableCell>
              //     <TableCell>{do?.items.reduce((sum, item) => sum + item.loadPerPrice, 0)}</TableCell>
              //     <TableCell>{field.amount}</TableCell>
              //     <TableCell>
              //       <Button
              //         type="button"
              //         variant="destructive"
              //         onClick={() => remove(index)}
              //       >
              //         <Trash className="h-4 w-4" />
              //       </Button>
              //     </TableCell>
              //   </TableRow>
              // )
            })}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem className="flex gap-4">
                <FormLabel className="flex w-40 items-center mt-2">
                  Total Amount
                </FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          <SaveAll className="mr-2 h-4 w-4" /> Save Invoice
        </Button>
      </form>
    </Form>
  )
}
