import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Team } from "@/lib/db/schema"
import type { roleTeamEnum } from "@/lib/db/schema/enums"

interface TeamHeaderProps {
  team: Team
  userRole: (typeof roleTeamEnum.enumValues)[number]
}

export function TeamHeader({ team, userRole }: TeamHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <Avatar className="h-16 w-16">
        {team.logo ? (
          <AvatarImage src={team.logo} alt={team.name} />
        ) : (
          <AvatarFallback className="text-lg">
            {team.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <Badge variant="outline">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>

        {team.description && (
          <p className="text-muted-foreground mt-1">{team.description}</p>
        )}
      </div>
    </div>
  )
}
