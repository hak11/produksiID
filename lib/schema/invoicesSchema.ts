import * as z from "zod"
import { deliveryOrderSchema } from "./deliveryOrderSchema"

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
  deliveryOrders: z.array(deliveryOrderSchema),
  doIds: z.array(z.number()),
})

export type InvoicesFormValues = z.infer<typeof invoiceSchema>


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