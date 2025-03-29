"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"] as const),
})

type FormValues = z.infer<typeof formSchema>

interface InviteMemberDialogProps {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({
  teamId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to invite member")
      }

      const data = await response.json()

      // If we have an invitation token, show the invite link
      if (data.token) {
        setInviteLink(`${window.location.origin}/invite/${data.token}`)
      } else {
        toast.success(`An invitation has been sent to ${values.email}.`)
        form.reset()
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite member"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopyLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast.success("Invitation link copied to clipboard")
    }
  }

  function handleClose() {
    setInviteLink(null)
    form.reset()
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your team. They will receive an email
            with instructions.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-sm">
              Share this invitation link with your team member:
            </p>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button onClick={handleCopyLink} size="sm">
                Copy
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
