import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TeamCard } from "./components/team-card"
import type { roleTeamEnum } from "@/lib/db/schema/enums"
import type { Team } from "@/lib/db/schema"
import { serverFetch } from "@/lib/fetch"

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

type TeamWithRole = Team & {
  role: (typeof roleTeamEnum.enumValues)[number]
}

async function getTeams(): Promise<TeamWithRole[]> {
  const response = await serverFetch(`${process.env.BASE_URL}/api/teams`)

   if (!response.ok) {
     throw new Error("Failed to fetch teams")
   }

   return response.json()
}

export default async function TeamsPage() {
  const teams = await getTeams()

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Link href="/dashboard/teams/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            You dont have any teams yet.
          </p>
          <Link href="/dashboard/teams/new">
            <Button>Create Your First Team</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} userRole={team.role} />
          ))}
        </div>
      )}
    </div>
  )
}
