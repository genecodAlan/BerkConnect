"use client"

import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Upload, X } from "lucide-react"
import { validateAndCompressImage } from "@/lib/image-compression"

interface CreatePostDialogProps {
  clubId: string
  clubName: string
  userId: string
  onPostCreated?: () => void
}

export const CreatePostDialog = memo(function CreatePostDialog({
  clubId,
  clubName,
  userId,
  onPostCreated,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate and compress the image
      const compressedFile = await validateAndCompressImage(file)
      
      if (!compressedFile) {
        // Validation or compression failed
        event.target.value = '' // Reset input
        return
      }

      setSelectedImage(compressedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const removeImage = useCallback(() => {
    setSelectedImage(null)
    setImagePreview(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return

    setLoading(true)

    try {
      let imageUrl = ""

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append("file", selectedImage)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.data.url
        }
      }

      // Create post
      const response = await fetch(`/api/clubs/${clubId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content,
          imageUrl,
        }),
      })

      if (response.ok) {
        setContent("")
        setSelectedImage(null)
        setImagePreview(null)
        setOpen(false)
        alert("Post created successfully!")
        onPostCreated?.()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [clubId, userId, content, selectedImage, onPostCreated])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setContent("")
      setSelectedImage(null)
      setImagePreview(null)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Create Post for {clubName}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Share an update with club members</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="post-content" className="text-sm">Post Content</Label>
            <Textarea
              id="post-content"
              placeholder="What's happening in your club?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] sm:min-h-[120px] text-sm"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="post-image" className="text-sm">Image (Optional)</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 sm:p-4 text-center">
                <input
                  type="file"
                  id="post-image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="post-image" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Click to upload image</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                  onClick={removeImage}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full h-9 sm:h-10 text-sm" disabled={!content.trim() || loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})
