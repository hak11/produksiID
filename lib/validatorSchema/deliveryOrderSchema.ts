import * as z from "zod"

export const deliveryOrderItemSchema = z.object({
    // doId: z.number(),
    loadQty: z.string(),
    // loadQtyActual: z.string(),
    loadPerPrice: z.string(),
    // customerName: z.string().optional(),
    // orderNumber: z.string().optional(),
    // supplierName: z.string().optional(),
    totalLoadPrice: z.string(),
    loadPerPriceStr: z.string(),
    totalLoadPriceStr: z.string()
  })

export const deliveryOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  supplierId: z.string(),
  customerId: z.string(),
  carId: z.string(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  deliveryStatus: z.enum(["pending", "in_progress", "completed", "canceled"]).default("pending"),
  deliveryAddress: z.string(),
  customerName: z.string(),
  supplierName: z.string(),
  deliveryDrivers: z.object({
    main: z.string(),
    assistant: z.string(),
  }),
  items: z.array(deliveryOrderItemSchema)
})

export type DeliveryOrderFormValues = z.infer<typeof deliveryOrderSchema>
export type DeliveryOrderItemFormValues = z.infer<typeof deliveryOrderItemSchema>

