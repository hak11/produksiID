import { Suspense } from "react"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AcceptInvitation } from "../../components/accept-invitation"
import { getSession } from "@/lib/auth/session"
import type { TeamInvitation, Team } from "@/lib/db/schema"

interface InvitationWithTeam extends TeamInvitation {
  team: Team
}

async function getInvitation(
  token: string
): Promise<InvitationWithTeam | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/invitations/${token}`,
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
  const session = await getSession()

  if (!session?.user) {
    redirect(`/login?callbackUrl=/teams/invite/${token}`)
  }

  const invitation = await getInvitation(token)

  if (!invitation) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if invitation has expired
  if (new Date() > invitation.expiresAt) {
    return (
      <div className="container max-w-md py-10">
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
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if invitation has already been accepted
  if (invitation.isAccepted) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`/teams/${invitation.teamId}`}>Go to Team</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if the user's email matches the invitation email
  if (session.user.email !== invitation.email) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Email Mismatch</CardTitle>
            <CardDescription>
              This invitation was sent to {invitation.email}, but you are logged
              in as {session.user.email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please log in with the correct email address to accept this
              invitation.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/login">Switch Account</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-10">
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
            <AcceptInvitation token={token} teamId={invitation.teamId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
