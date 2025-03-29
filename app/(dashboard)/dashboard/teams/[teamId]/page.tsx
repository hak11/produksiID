import { Suspense } from "react"
import { redirect, notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamHeader } from "../components/team-header"
import { TeamMembers } from "../components/team-members"
import { TeamSettings } from "../components/team-settings"
import { getSession } from "@/lib/auth/session"
import type { Team, TeamMember, User } from "@/lib/db/schema"
import type { roleTeamEnum } from "@/lib/db/schema/enums"
import { serverFetch } from "@/lib/fetch"

interface TeamWithMembersAndUsers extends Team {
  members: (TeamMember & { user: User })[]
  userRole: (typeof roleTeamEnum.enumValues)[number]
}

async function getTeamDetails(
  teamId: string
): Promise<TeamWithMembersAndUsers> {
  const response = await serverFetch(
    `${process.env.BASE_URL}/api/teams/${teamId}`,
    {
      cache: "no-store",
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error("Failed to fetch team details")
  }

  return response.json()
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const team = await getTeamDetails(teamId)

  const isAdmin = team.userRole === "owner" || team.userRole === "admin"

  return (
    <div className="container py-10">
      <TeamHeader team={team} userRole={team.userRole} />

      <Tabs defaultValue="members" className="mt-8">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Suspense fallback={<div>Loading members...</div>}>
            <TeamMembers
              team={team}
              members={team.members}
              userRole={team.userRole}
              userId={session.user.id}
            />
          </Suspense>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="mt-6">
            <TeamSettings team={team} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
