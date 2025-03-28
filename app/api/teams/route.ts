import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db/drizzle"
import { teams } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { generateSlug } from "@/lib/utils"

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or has permission to create teams
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = createTeamSchema.parse(body)

    // Generate a slug from the team name
    const slug = generateSlug(validatedData.name)

    // Create the team
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        slug,
        logo: validatedData.logo,
        createdById: session.user.id,
      })
      .returning()

    return NextResponse.json(newTeam, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teams where the user is a member
    const userTeams = await db.query.teamMembers.findMany({
      where: (teamMembers, { eq }) => eq(teamMembers.userId, session.user.id),
      with: {
        team: true,
      },
    })

    // Format the response to include the role
    const teams = userTeams.map((member) => ({
      ...member.team,
      role: member.role,
    }))

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}
