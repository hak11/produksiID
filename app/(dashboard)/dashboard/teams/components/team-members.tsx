"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { InviteMemberDialog } from "./invite-member-dialog"
import type { Team, TeamMember, User } from "@/lib/db/schema"
import type { roleTeamEnum } from "@/lib/db/schema/enums"

interface TeamMembersProps {
  team: Team
  members: (TeamMember & { user: User })[]
  userRole: (typeof roleTeamEnum.enumValues)[number]
  userId: string
}

export function TeamMembers({
  team,
  members,
  userRole,
  userId,
}: TeamMembersProps) {
  const router = useRouter()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Update the isAdmin check to use the roleTeamEnum
  const isAdmin = userRole === "owner" || userRole === "admin"

  // Update the handleChangeMemberRole function to use the roleTeamEnum
  async function handleChangeMemberRole(
    memberId: string,
    newRole: (typeof roleTeamEnum.enumValues)[number]
  ) {
    setIsLoading(memberId)

    try {
      const response = await fetch(
        `/api/teams/${team.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update member role")
      }

      toast({
        title: "Role updated",
        description: "The member's role has been updated.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update member role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  async function handleRemoveMember(memberId: string) {
    setIsLoading(memberId)

    try {
      const response = await fetch(
        `/api/teams/${team.id}/members/${memberId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }

      toast({
        title: "Member removed",
        description: "The member has been removed from the team.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Team Members</h2>
        {isAdmin && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={member.user.image || ""}
                    alt={member.user.name || ""}
                  />
                  <AvatarFallback>
                    {member.user.name
                      ? member.user.name.substring(0, 2).toUpperCase()
                      : member.user.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === "owner" ? "default" : "outline"}
                >
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>

                {isAdmin &&
                  member.role !== "owner" &&
                  member.userId !== userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading === member.id}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role === "member" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeMemberRole(member.id, "admin")
                            }
                          >
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeMemberRole(member.id, "member")
                            }
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                {!isAdmin &&
                  member.userId === userId &&
                  member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading === member.id}
                    >
                      Leave
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InviteMemberDialog
        teamId={team.id}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  )
}
