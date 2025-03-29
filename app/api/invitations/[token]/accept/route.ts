import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/drizzle"
import { teamInvitations, teamMembers, users } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { eq } from "drizzle-orm"
import { hash } from "bcryptjs"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const session = await getSession()
    const body = await req.json()

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

    // If user is logged in
    if (session?.user) {
      // Check if the user's email matches the invitation email
      if (invitation.email && session.user.email !== invitation.email) {
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
    }
    // If user is not logged in
    else {
      // Check if user exists with the invitation email
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, invitation.email),
      })

      // If user exists but is not logged in
      if (existingUser) {
        return NextResponse.json(
          {
            error: "Please login to accept this invitation",
            code: "LOGIN_REQUIRED",
            email: invitation.email,
          },
          { status: 401 }
        )
      }

      // If user doesn't exist and no password provided
      if (!body.password) {
        return NextResponse.json(
          {
            error: "User not found",
            code: "USER_NOT_FOUND",
            email: invitation.email,
          },
          { status: 404 }
        )
      }

      // Create new user with information from invitation
      const passwordHash = await hash(body.password, 10)

      const [newUser] = await db
        .insert(users)
        .values({
          email: invitation.email,
          name: invitation.email.split("@")[0],
          passwordHash,
          role: invitation.role,
        })
        .returning()

      // Add the user as a team member
      await db.insert(teamMembers).values({
        teamId: invitation.teamId,
        userId: newUser.id,
        role: invitation.role,
        invitedById: invitation.invitedById,
      })

      // Mark invitation as accepted
      await db
        .update(teamInvitations)
        .set({ isAccepted: true })
        .where(eq(teamInvitations.id, invitation.id))

      return NextResponse.json(
        {
          success: true,
          message:
            "Account created successfully. Please login to access your team.",
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    )
  }
}
