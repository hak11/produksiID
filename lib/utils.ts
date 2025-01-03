import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: string) => {
  const number = parseFloat(value.replace(/[^\d]/g, "")) || 0
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number)
}

export const generatNumberByDB = async (url: string, key: string, frontPrefix: string = "", padStart: number = 2 ) => {
    try {
      const response = await fetch(url)
      const dataResponse = await response.json()
      const dataFromKey = dataResponse[key]
      const newNumber = parseInt(dataFromKey?.slice(1)) + 1 || 1
      return `${frontPrefix}}${newNumber.toString().padStart(padStart, "0")}`
    } catch (error) {
      console.error("Failed to generate order number:", error)
    }
  }