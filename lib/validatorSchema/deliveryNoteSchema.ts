import * as z from "zod";

export const deliveryNoteItemSchema = z.object({
  id: z.string().optional(),
  deliveryOrderId: z.string(),
  deliveryOrderItemId: z.string(),
  name: z.string(),
  deliveryDate: z.date().optional(),
  customerName: z.string(),
  supplierName: z.string(),
  loadQty: z.number(),
  doNumber: z.string(),
  actualQty: z.number().optional(),
});

export const deliveryNoteSchema = z.object({
  id: z.string().optional(),
  noteNumber: z.string(),
  issueDate: z.date(),
  status: z.enum(["draft", "printed", "delivered", "cancelled"]).default("draft"),
  remarks: z.string().optional(),
  items: z.array(deliveryNoteItemSchema),
});

export type DeliveryNoteFormValues = z.infer<typeof deliveryNoteSchema>;
export type DeliveryNoteItemFormValues = z.infer<typeof deliveryNoteItemSchema>;
