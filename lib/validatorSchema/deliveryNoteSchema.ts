import * as z from "zod";

export const deliveryNoteItemSchema = z.object({
  id: z.string().optional(),
  deliveryOrderId: z.string(),
  actualQty: z.string(),
});

export const deliveryNoteSchema = z.object({
  id: z.string().optional(),
  noteNumber: z.string(),
  issueDate: z.string(),
  status: z.enum(["draft", "printed", "delivered", "cancelled"]).default("draft"),
  remarks: z.string().optional(),
  items: z.array(deliveryNoteItemSchema),
});

export type DeliveryNoteFormValues = z.infer<typeof deliveryNoteSchema>;
export type DeliveryNoteItemFormValues = z.infer<typeof deliveryNoteItemSchema>;
