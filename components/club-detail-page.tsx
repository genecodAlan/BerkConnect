"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  Crown,
  Shield,
  UserCog,
  MessageSquare,
  Palette,
  Gamepad2,
  BookOpen,
  Trophy,
  Heart,
  Code,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ManageLeadershipDialog } from "./manage-leadership-dialog"
import { EditClubDialog } from "./edit-club-dialog"
import { ManageTagsDialog } from "./manage-tags-dialog"

interface ClubMember {
  id: string
  user_id: string
  role: string
  joined_at: string
  name: string
  email: string
  avatar_url: string | null
}

interface ClubPost {
  id: string
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  author_avatar: string | null
}

interface Club {
  id: string
  name: string
  description: string
  category: "academic" | "arts" | "sports" | "technology" | "service" | "hobby"
  member_count: number
  meeting_time: string | null
  location: string | null
  image_url: string | null
  is_joined: boolean
  is_claimed: boolean
  president_name: string | null
  president_avatar: string | null
  president_email: string | null
  tags: string[]
  memberRole: string | null
}

const categoryIcons = {
  academic: BookOpen,
  arts: Palette,
  sports: Trophy,
  technology: Code,
  service: Heart,
  hobby: Gamepad2,
}

const categoryColors = {
  academic: "bg-blue-100 text-blue-800",
  arts: "bg-purple-100 text-purple-800",
  sports: "bg-green-100 text-green-800",
  technology: "bg-orange-100 text-orange-800",
  service: "bg-red-100 text-red-800",
  hobby: "bg-yellow-100 text-yellow-800",
}

const roleIcons = {
  president: Crown,
  vice_president: Shield,
  officer: UserCog,
  member: Users,
}

export function ClubDetailPage({ clubId }: { clubId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [posts, setPosts] = useState<ClubPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadClubDetails = useCallback(async () => {
    try {
      setLoading(true)
      const url = user?.id
        ? `/api/clubs/${clubId}/details?userId=${user.id}`
        : `/api/clubs/${clubId}/details`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const result = await response.json()
        setClub(result.data.club)
        setMembers(result.data.members)
        setPosts(result.data.posts)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to load club details:", response.status, errorData)
        router.push("/")
      }
    } catch (error) {
      console.error("Error loading club details:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [clubId, user?.id, router])

  useEffect(() => {
    loadClubDetails()
  }, [loadClubDetails])

  const handleJoinLeave = useCallback(async () => {
    if (!user?.id || !club) return

    try {
      if (club.is_joined) {
        const response = await fetch(`/api/clubs/${clubId}/join?userId=${user.id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          await loadClubDetails()
        }
      } else {
        const response = await fetch(`/api/clubs/${clubId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
        if (response.ok) {
          await loadClubDetails()
        }
      }
    } catch (error) {
      console.error("Error joining/leaving club:", error)
      alert("Failed to update membership. Please try again.")
    }
  }, [user?.id, club, clubId, loadClubDetails])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading club details...</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return null
  }

  const CategoryIcon = categoryIcons[club.category]
  const isLeader = club.memberRole && ["president", "vice_president", "officer"].includes(club.memberRole)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-2 sm:mb-4 h-9 text-sm" size="sm">
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
        Back to Clubs
      </Button>

      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 rounded-lg overflow-hidden">
        <img
          src={club.image_url || "/placeholder.svg"}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1.5 sm:mb-2 truncate">{club.name}</h1>
              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                <Badge className={`${categoryColors[club.category]} text-xs`}>
                  <CategoryIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  {club.category}
                </Badge>
                {!club.is_claimed && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                    Unclaimed
                  </Badge>
                )}
                {isLeader && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                    <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    Leadership
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Club Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="text-base sm:text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-sm sm:text-base text-muted-foreground">{club.description}</p>

              {club.is_claimed && (club.meeting_time || club.location) && (
                <>
                  <Separator />
                  <div className="space-y-1.5 sm:space-y-2">
                    {club.meeting_time && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{club.meeting_time}</span>
                      </div>
                    )}
                    {club.location && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{club.location}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {club.tags && club.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {club.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Posts Section */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {posts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarImage src={post.author_avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {post.author_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">{post.author_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm">{post.content}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="rounded-lg w-full max-h-48 sm:max-h-64 object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm sm:text-base text-muted-foreground py-6 sm:py-8">No posts yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
              {club.is_claimed ? (
                <>
                  {user?.id && (
                    <Button
                      onClick={handleJoinLeave}
                      variant={club.is_joined ? "outline" : "default"}
                      className={
                        club.is_joined
                          ? "w-full border-green-500 text-green-600 hover:bg-green-50 h-9 sm:h-10 text-sm"
                          : "w-full h-9 sm:h-10 text-sm"
                      }
                    >
                      {club.is_joined ? "Joined" : "Join Club"}
                    </Button>
                  )}
                  {isLeader && (
                    <>
                      <EditClubDialog
                        clubId={club.id}
                        clubName={club.name}
                        currentDescription={club.description}
                        currentCategory={club.category}
                        currentMeetingTime={club.meeting_time}
                        currentLocation={club.location}
                        currentImageUrl={club.image_url}
                        onUpdateSuccess={loadClubDetails}
                      />
                      <ManageTagsDialog
                        clubId={club.id}
                        clubName={club.name}
                        currentTags={club.tags || []}
                        onUpdateSuccess={loadClubDetails}
                      />
                      {club.memberRole === "president" && (
                        <ManageLeadershipDialog
                          clubId={club.id}
                          clubName={club.name}
                          currentUserId={user?.id || ""}
                          isPresident={true}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-2">
                  This club is unclaimed. Visit the main clubs page to claim it.
                </p>
              )}
            </CardContent>
          </Card>

          {/* President Info */}
          {club.is_claimed && club.president_name && (
            <Card>
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="text-sm sm:text-base">Club President</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={club.president_avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {club.president_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{club.president_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{club.president_email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Members ({club.member_count})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || Users
                  return (
                    <div key={member.id} className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                          <RoleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {member.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
