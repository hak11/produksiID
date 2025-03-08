import { useEffect, useState } from "react"
import { DeliveryOrder } from "@/lib/db/schema"

export function useDeliveryData() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doResponse] = await Promise.all([
          fetch("/api/delivery-order?team_id="),
        ])

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
  }, [])

  return { deliveryOrders, isLoading, error }
}

