import { Suspense } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvitationDetails } from "../components/invitation-details"
import { serverFetch } from "@/lib/fetch"
import type { TeamInvitation, Team } from "@/lib/db/schema"

interface InvitationWithTeam extends TeamInvitation {
  team: Team
}

async function getInvitation(
  token: string
): Promise<InvitationWithTeam | null> {
  try {
    const response = await serverFetch(
      `${process.env.BASE_URL}/api/invitations/${token}`,
      {
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return null
  }
}


export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invitation = await getInvitation(token)

  if (!invitation) {
    return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    )
  }

  if (new Date() > invitation.expiresAt) {
    return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please ask the team admin to send a
              new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    )
  }

  if (invitation.isAccepted) {
    return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Login to Access Team</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>
              Youve been invited to join {invitation.team.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Youve been invited to join this team as a{" "}
              <strong>{invitation.role}</strong>.
            </p>
            <Suspense fallback={<div>Loading...</div>}>
              <InvitationDetails invitation={invitation} token={token} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
