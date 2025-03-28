import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db/drizzle"
import { teamMembers } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { eq, and } from "drizzle-orm"

const updateMemberSchema = z.object({
  role: z.enum(["admin", "member"]),
})

async function isTeamAdmin(userId: string, teamId: string) {
  
  const member = await db.query.teamMembers.findFirst({
    where: (teamMembers, { eq, and, or }) =>
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        or(eq(teamMembers.role, "owner"), eq(teamMembers.role, "admin"))
      ),
  })

  return !!member
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {

    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, memberId } = await params

    // Check if user is an admin of the team
    if (!(await isTeamAdmin(session.user.id, teamId))) {
      return NextResponse.json(
        { error: "You don't have permission to update members" },
        { status: 403 }
      )
    }

    // Get the member to update
    const memberToUpdate = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)),
    })

    if (!memberToUpdate) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Cannot update the owner's role
    if (memberToUpdate.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change the role of the team owner" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role } = updateMemberSchema.parse(body)

    // Update the member
    const [updatedMember] = await db
      .update(teamMembers)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))
      .returning()

    return NextResponse.json(updatedMember)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating team member:", error)
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId, memberId } = await params

    // Check if user is an admin of the team
    const isAdmin = await isTeamAdmin(session.user.id, teamId)

    // Get the member to remove
    const memberToRemove = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq, and }) =>
        and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)),
    })

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Cannot remove the owner
    if (memberToRemove.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the team owner" },
        { status: 403 }
      )
    }

    // Users can remove themselves, or admins can remove others
    if (memberToRemove.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to remove this member" },
        { status: 403 }
      )
    }

    // Remove the member
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}
