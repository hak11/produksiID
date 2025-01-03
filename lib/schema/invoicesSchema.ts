import * as z from "zod"
import { deliveryOrderSchema, deliveryOrderItemSchema } from "./deliveryOrderSchema"

export const doInvoiceItemSchema = deliveryOrderItemSchema.extend({
    doId: z.number(),
    loadQtyActual: z.string(),
    customerName: z.string().optional(),
    orderNumber: z.string().optional(),
    supplierName: z.string().optional(),
  })


export const doInvoiceSchema = deliveryOrderSchema.extend({
  items: z.array(doInvoiceItemSchema)
})


export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string({
    required_error: "Invoice date is required",
  }),
  companyId: z.number(),
  dueDate: z.string({
    required_error: "Due date is required",
  }),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  totalAmount: z.string().min(1, "Total amount is required"),
  notes: z.string().optional(),
  deliveryOrders: z.array(doInvoiceSchema),
  doIds: z.array(z.number()),
})

export type InvoicesFormValues = z.infer<typeof invoiceSchema>
export type DoInvoiceItemFormValues = z.infer<typeof doInvoiceItemSchema>
export type DoInvoiceFormValues = z.infer<typeof doInvoiceSchema>


// export const insertInvoiceSchema = createInsertSchema(invoices).extend({
//   deliveryOrders: z.array(
//     z.object({
//       deliveryOrderId: z.number(),
//       amount: z.number(),
//     })
//   ),
// });


// Zod schema for invoice
// export const insertInvoiceSchema = createInsertSchema(invoices).extend({
//   deliveryOrders: z.array(
//     z.object({
//       deliveryOrderId: z.number(),
//       amount: z.number(),
//     })
//   ),
// });