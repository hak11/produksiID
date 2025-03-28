import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db/drizzle"
import { teamMembers, teamInvitations } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { v4 as uuidv4 } from "uuid"
// import { sendEmail } from "@/lib/email" // Assuming you have an email service

// Schema for inviting a member
const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
})

// Helper function to check if user is a team admin
async function isTeamAdmin(userId: string, teamId: string) {
  const member = await db.query.teamMembers.findFirst({
    where: (teamMembers, { eq, and, or }) =>
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        or(
          eq(teamMembers.role, "owner"),
          eq(teamMembers.role, "admin")
        )
      ),
  })

  return !!member
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Check if user is an admin of the team
    if (!(await isTeamAdmin(session.user.id, teamId))) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, role } = inviteMemberSchema.parse(body)

    // Check if the user is already a member
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (existingUser) {
      const existingMember = await db.query.teamMembers.findFirst({
        where: (teamMembers, { eq, and }) =>
          and(
            eq(teamMembers.userId, existingUser.id),
            eq(teamMembers.teamId, teamId)
          ),
      })

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this team" },
          { status: 400 }
        )
      }

      // Add the user directly as a member
      const [newMember] = await db
        .insert(teamMembers)
        .values({
          teamId,
          userId: existingUser.id,
          role,
          invitedById: session.user.id,
        })
        .returning()

      return NextResponse.json(newMember, { status: 201 })
    }

    // Create an invitation
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const [invitation] = await db
      .insert(teamInvitations)
      .values({
        teamId,
        email,
        role,
        token,
        expiresAt,
        invitedById: session.user.id,
      })
      .returning()

    // Send invitation email
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, teamId),
    })

    if (team) {
      // await sendEmail({
      //   to: email,
      //   subject: `Invitation to join ${team.name}`,
      //   html: `
      //     <p>You've been invited to join ${team.name} as a ${role}.</p>
      //     <p>Click the link below to accept the invitation:</p>
      //     <a href="${process.env.NEXT_PUBLIC_APP_URL}/teams/invite/${token}">Accept Invitation</a>
      //   `,
      // })
    }

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error inviting team member:", error)
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Check if user is a member of the team
    const isMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, teamId)
        ),
    })

    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      )
    }

    // Get team members
    const members = await db.query.teamMembers.findMany({
      where: (teamMembers, { eq }) => eq(teamMembers.teamId, teamId),
      with: {
        user: true,
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}
