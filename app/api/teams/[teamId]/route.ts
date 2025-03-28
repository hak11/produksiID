import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db/drizzle"
import { teams } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { eq, or } from "drizzle-orm"

// Schema for team update
const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
})

// Helper function to check if user is a team admin
async function isTeamAdmin(userId: string, teamId: string) {
  const member = await db.query.teamMembers.findFirst({
    where: (teamMembers, { eq, and }) =>
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        or(eq(teamMembers.role, "owner"), eq(teamMembers.role, "admin"))
      ),
  })

  return !!member
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
    const membership = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, teamId)
        ),
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this team" },
        { status: 403 }
      )
    }

    // Get team with members
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, teamId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        invitations: true,
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Add the user's role to the response
    return NextResponse.json({
      ...team,
      userRole: membership.role,
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PATCH(
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
        { error: "You don't have permission to update this team" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = updateTeamSchema.parse(body)

    // Update the team
    const [updatedTeam] = await db
      .update(teams)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId))
      .returning()

    return NextResponse.json(updatedTeam)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating team:", error)
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Check if user is the owner of the team
    const isOwner = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.role, "owner")
        ),
    })

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the team owner can delete the team" },
        { status: 403 }
      )
    }

    // Delete the team (cascade will handle members and invitations)
    await db.delete(teams).where(eq(teams.id, teamId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    )
  }
}
