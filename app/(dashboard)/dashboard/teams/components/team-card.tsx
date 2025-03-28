import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Team } from "@/lib/db/schema"
import type { roleTeamEnum } from "@/lib/db/schema/enums"

interface TeamCardProps {
  team: Team
  userRole: (typeof roleTeamEnum.enumValues)[number]
}

export function TeamCard({ team, userRole }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            {team.logo ? (
              <AvatarImage src={team.logo} alt={team.name} />
            ) : (
              <AvatarFallback>
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>{team.name}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2">
            {team.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
