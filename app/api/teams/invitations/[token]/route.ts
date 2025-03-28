import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/drizzle"
import { teamInvitations, teamMembers } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const {token} = await params

    // Get the invitation
    const invitation = await db.query.teamInvitations.findFirst({
      where: (teamInvitations, { eq }) => eq(teamInvitations.token, token),
      with: {
        team: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await params

    // Get the invitation
    const invitation = await db.query.teamInvitations.findFirst({
      where: (teamInvitations, { eq }) => eq(teamInvitations.token, token),
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      )
    }

    // Check if invitation has already been accepted
    if (invitation.isAccepted) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      )
    }

    // Check if the user's email matches the invitation email
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation is for a different email address" },
        { status: 403 }
      )
    }

    // Check if user is already a member of the team
    const existingMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, invitation.teamId)
        ),
    })

    if (existingMember) {
      // Mark invitation as accepted
      await db
        .update(teamInvitations)
        .set({ isAccepted: true })
        .where(eq(teamInvitations.id, invitation.id))

      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      )
    }

    // Add the user as a member
    const [newMember] = await db
      .insert(teamMembers)
      .values({
        teamId: invitation.teamId,
        userId: session.user.id,
        role: invitation.role,
        invitedById: invitation.invitedById,
      })
      .returning()

    // Mark invitation as accepted
    await db
      .update(teamInvitations)
      .set({ isAccepted: true })
      .where(eq(teamInvitations.id, invitation.id))

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    )
  }
}
