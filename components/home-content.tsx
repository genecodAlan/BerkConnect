"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface ClubPost {
  id: string
  club_id: string
  club_name?: string
  club_avatar?: string
  author_name: string
  author_avatar: string | null
  author_email: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  isLiked?: boolean
}

export function HomeContent() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ClubPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Load posts with pagination
  const loadPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const url = user?.id
        ? `/api/feed?page=${pageNum}&limit=20&userId=${user.id}`
        : `/api/feed?page=${pageNum}&limit=20`

      const response = await fetch(url)
      if (!response.ok) return

      const result = await response.json()
      
      if (append) {
        setPosts((prev) => [...prev, ...result.data])
      } else {
        setPosts(result.data)
      }

      setHasMore(result.pagination.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more posts
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true)
    }
  }

  useEffect(() => {
    loadPosts(1, false)
  }, [user?.id])

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user?.id) {
      alert("Please log in to like posts")
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: data.liked,
                  likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1,
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading club posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Club Feed</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Posts from all school clubs</p>
      </div>

      {/* Posts Feed */}
      <div className="space-y-3 sm:space-y-4">
        {posts.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
              <p className="text-base sm:text-lg text-muted-foreground">No club posts yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Join a club to see posts from your clubs!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={post.club_avatar || "/placeholder.svg"} alt={post.club_name || "Club"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {(post.club_name || "C")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate">{post.club_name || "Club"}</h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs flex-shrink-0">
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                          Club
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span className="truncate">Posted by {post.author_name}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="text-xs">{formatTimestamp(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                <p className="text-sm sm:text-base text-card-foreground leading-relaxed">{post.content}</p>

                {post.image_url && (
                  <div className="rounded-lg overflow-hidden -mx-3 sm:mx-0">
                    <img
                      src={post.image_url.startsWith("data:") ? post.image_url : post.image_url}
                      alt="Post content"
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3 sm:gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.isLiked || false)}
                      className={`gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 ${post.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                    >
                      <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span className="text-xs sm:text-sm">{post.likes_count || 0}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more posts...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                You've reached the end of the feed
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
