import { useEffect, useState } from "react"
import { Company, Car } from "@/lib/db/schema"

export function useDeliveryData() {
  const [suppliers, setSuppliers] = useState<Company[]>([])
  const [customers, setCustomers] = useState<Company[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, carsResponse] = await Promise.all([
          fetch("/api/company"),
          fetch("/api/cars")
        ])

        if (!companiesResponse.ok || !carsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const companies = await companiesResponse.json()
        const carsData = await carsResponse.json()

        setSuppliers(
          companies.filter((c: Company & { companyRoles: string[] }) => 
            c.companyRoles.includes("supplier")
          )
        )
        setCustomers(
          companies.filter((c: Company & { companyRoles: string[] }) => 
            c.companyRoles.includes("customer")
          )
        )
        setCars(carsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { suppliers, customers, cars, isLoading, error }
}

