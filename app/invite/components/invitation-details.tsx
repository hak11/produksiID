"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useUser, UserContextType } from "@/lib/auth"
import type { TeamInvitation, Team } from "@/lib/db/schema"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface InvitationDetailsProps {
  invitation: TeamInvitation & { team: Team }
  token: string
}

export function InvitationDetails({
  invitation,
  token,
}: InvitationDetailsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { user } = useUser() as UserContextType

  async function handleAcceptInvitation() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        // If user doesn't exist, show password form
        if (response.status === 404 && data.code === "USER_NOT_FOUND") {
          setShowPasswordForm(true)
          setIsLoading(false)
          return
        }

        throw new Error(data.error || "Failed to accept invitation")
      }

      toast.success("You have successfully joined the team.")

      // Redirect to teams page if user is logged in
      if (user) {
        router.push("/teams")
      } else {
        // Redirect to login page if user was created but needs to login
        router.push("/login")
      }

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation"
      )
      setIsLoading(false)
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create account")
      }

      toast.success(
        "Account created successfully. Please login to access your team."
      )
      router.push(`/sign-in?email=${encodeURIComponent(invitation.email)}`)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      )
      setIsLoading(false)
    }
  }

  
  if (user && user.email !== invitation.email) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Email Mismatch</CardTitle>
            <CardDescription>
              You are currently logged in as <strong>{user.email}</strong> but
              this invitation is intended for{" "}
              <strong>{invitation.email}</strong>. Please logout and log in with
              the correct account to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/logout">Logout</Link>
            </Button>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Show password form if needed
  if (showPasswordForm) {
    return (
      <div className="space-y-4">
        <p>Create a password to complete your account setup.</p>
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>
    )
  }

  // Simple accept button for all other cases
  return (
    <div className="space-y-4">
      <Button
        onClick={handleAcceptInvitation}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Accept Invitation"}
      </Button>
      <Button variant="outline" asChild className="w-full">
        <Link href="/">Decline</Link>
      </Button>
    </div>
  )
}
