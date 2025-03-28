"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface AcceptInvitationProps {
  token: string
  teamId: string
}

interface ApiError {
  error: string
}

export function AcceptInvitation({ token, teamId }: AcceptInvitationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleAcceptInvitation() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/teams/invitations/${token}`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError
        throw new Error(errorData.error || "Failed to accept invitation")
      }

      toast({
        title: "Invitation accepted",
        description: "You have successfully joined the team.",
      })

      router.push(`/teams/${teamId}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={handleAcceptInvitation}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Accepting..." : "Accept Invitation"}
      </Button>
      <Button variant="outline" asChild className="w-full">
        <a href="/teams">Decline</a>
      </Button>
    </div>
  )
}
