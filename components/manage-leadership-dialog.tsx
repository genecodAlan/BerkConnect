"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCog, Crown, Users, Trash2, Plus } from "lucide-react"

interface ClubMember {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url?: string
  role: string
  joined_at: string
}

interface ManageLeadershipDialogProps {
  clubId: string
  clubName: string
  currentUserId: string
  isPresident: boolean
}

const LEADERSHIP_ROLES = [
  { value: 'president', label: 'President', icon: Crown },
  { value: 'vice_president', label: 'Vice President', icon: UserCog },
  { value: 'officer', label: 'Officer', icon: Users },
]

export function ManageLeadershipDialog({ clubId, clubName, currentUserId, isPresident }: ManageLeadershipDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [leaders, setLeaders] = useState<ClubMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newLeaderEmail, setNewLeaderEmail] = useState("")
  const [newLeaderRole, setNewLeaderRole] = useState("officer")

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/clubs/${clubId}/members`)
      if (response.ok) {
        const data = await response.json()
        const allMembers = data.data || []
        
        // Separate leaders from regular members
        const leaderRoles = ['president', 'vice_president', 'officer']
        const leadersList = allMembers.filter((member: ClubMember) => leaderRoles.includes(member.role))
        const membersList = allMembers.filter((member: ClubMember) => !leaderRoles.includes(member.role))
        
        setLeaders(leadersList)
        setMembers(membersList)
      }
    } catch (error) {
      console.error("Error loading members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
  }, [isOpen, clubId])

  const handlePromoteMember = async (memberId: string, role: string) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/members/${memberId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, updatedBy: currentUserId }),
      })

      if (response.ok) {
        await loadMembers()
        alert(`Member promoted to ${LEADERSHIP_ROLES.find(r => r.value === role)?.label} successfully!`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to promote member")
      }
    } catch (error) {
      console.error("Error promoting member:", error)
      alert("Failed to promote member. Please try again.")
    }
  }

  const handleDemoteLeader = async (leaderId: string) => {
    if (leaderId === currentUserId) {
      alert("You cannot demote yourself. Use the transfer presidency feature instead.")
      return
    }

    if (confirm("Are you sure you want to demote this leader to a regular member?")) {
      try {
        const response = await fetch(`/api/clubs/${clubId}/members/${leaderId}/role`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "member", updatedBy: currentUserId }),
        })

        if (response.ok) {
          await loadMembers()
          alert("Leader demoted successfully!")
        } else {
          const data = await response.json()
          alert(data.error || "Failed to demote leader")
        }
      } catch (error) {
        console.error("Error demoting leader:", error)
        alert("Failed to demote leader. Please try again.")
      }
    }
  }

  const handleAddLeaderByEmail = async () => {
    if (!newLeaderEmail.trim()) {
      alert("Please enter an email address")
      return
    }

    try {
      const response = await fetch(`/api/clubs/${clubId}/members/add-leader`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newLeaderEmail,
          role: newLeaderRole,
          addedBy: currentUserId,
        }),
      })

      if (response.ok) {
        await loadMembers()
        setNewLeaderEmail("")
        setNewLeaderRole("officer")
        alert("Leader added successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to add leader")
      }
    } catch (error) {
      console.error("Error adding leader:", error)
      alert("Failed to add leader. Please try again.")
    }
  }

  const getRoleIcon = (role: string) => {
    const roleConfig = LEADERSHIP_ROLES.find(r => r.value === role)
    return roleConfig?.icon || Users
  }

  const getRoleLabel = (role: string) => {
    const roleConfig = LEADERSHIP_ROLES.find(r => r.value === role)
    return roleConfig?.label || role
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'president': return 'bg-yellow-100 text-yellow-800'
      case 'vice_president': return 'bg-blue-100 text-blue-800'
      case 'officer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isPresident) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Manage Leadership">
          <UserCog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Manage Leadership - {clubName}
          </DialogTitle>
          <DialogDescription>
            Add, promote, or manage leadership roles for your club members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Leaders */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Current Leadership</h3>
            {leaders.length > 0 ? (
              <div className="space-y-2">
                {leaders.map((leader) => {
                  const RoleIcon = getRoleIcon(leader.role)
                  return (
                    <div key={leader.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={leader.avatar_url || "/placeholder.svg"} alt={leader.name} />
                          <AvatarFallback className="text-xs">
                            {leader.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{leader.name}</p>
                          <p className="text-sm text-muted-foreground">{leader.email}</p>
                        </div>
                        <Badge className={getRoleBadgeColor(leader.role)}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {getRoleLabel(leader.role)}
                        </Badge>
                      </div>
                      {leader.user_id !== currentUserId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoteLeader(leader.user_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Demote
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No other leaders assigned yet.</p>
            )}
          </div>

          {/* Add Leader by Email */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Add New Leader</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="leader-email">Email Address</Label>
                <Input
                  id="leader-email"
                  type="email"
                  placeholder="Enter member's email"
                  value={newLeaderEmail}
                  onChange={(e) => setNewLeaderEmail(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Label htmlFor="leader-role">Role</Label>
                <Select value={newLeaderRole} onValueChange={setNewLeaderRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEADERSHIP_ROLES.filter(role => role.value !== 'president').map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddLeaderByEmail} disabled={!newLeaderEmail.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Promote Members */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Promote Members</h3>
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="outline">Member</Badge>
                    </div>
                    <div className="flex gap-1">
                      {LEADERSHIP_ROLES.filter(role => role.value !== 'president').map((role) => (
                        <Button
                          key={role.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteMember(member.user_id, role.value)}
                        >
                          {role.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No regular members to promote.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}