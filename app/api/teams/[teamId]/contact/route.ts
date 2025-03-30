import { type NextRequest, NextResponse } from "next/server"
import { teams } from "@/lib/db/schema"
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle"
import { getSession } from "@/lib/auth/session"

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

    const contactTeam = await db
      .select({
        id: teams.id,
        name: teams.name,
        contact_pic_name: teams.contact_pic_name,
        contact_address: teams.contact_address,
        contact_email: teams.contact_email,
        contact_phone: teams.contact_phone,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
    
    return NextResponse.json(contactTeam[0])
  } catch (error) {
    console.error("Error fetching data teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    )
  }
}
