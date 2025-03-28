import { z } from "zod"
import { useEffect, useState } from "react"
import type { DeliveryOrder, DeliveryStatus } from "@/lib/db/schema"

export type DeliveryOrderListType = DeliveryOrder & {
  supplierName: string
  customerName: string
}

export function useDeliveryOrder(status?: z.infer<typeof DeliveryStatus>) {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrderListType[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = status ? `?status=${status}` : ""
        const doResponse = await fetch(`/api/delivery-order${params}`)

        if (!doResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const deliveryOrders = await doResponse.json()

        setDeliveryOrders(deliveryOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status])

  return { deliveryOrders, isLoading, error }
}
