import * as z from "zod"

export const deliveryOrderSchema = z.object({
  orderNumber: z.string(),
  supplierId: z.number(),
  customerId: z.number(),
  carId: z.number(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  deliveryStatus: z.enum(["pending", "in_progress", "completed", "canceled"]).default("pending"),
  deliveryAddress: z.string(),
  items: z.array(z.object({
    loadQty: z.string(),
    loadPerPrice: z.string(),
    totalLoadPrice: z.string(),
    loadPerPriceStr: z.string(),
    totalLoadPriceStr: z.string()
  }))
})

export type DeliveryOrderFormValues = z.infer<typeof deliveryOrderSchema>

