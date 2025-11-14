"use client"

import { useState, useEffect, useCallback, memo } from "react"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag, X } from "lucide-react"

interface ManageTagsDialogProps {
  clubId: string
  clubName: string
  currentTags: string[]
  onUpdateSuccess: () => void
}

export const ManageTagsDialog = memo(function ManageTagsDialog({
  clubId,
  clubName,
  currentTags,
  onUpdateSuccess,
}: ManageTagsDialogProps) {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTags(currentTags)
      setNewTag("")
    }
  }, [open, currentTags])

  const handleAddTag = useCallback(() => {
    const trimmedTag = newTag.trim().toLowerCase()
    if (!trimmedTag) return
    if (tags.includes(trimmedTag)) {
      alert("Tag already exists")
      return
    }
    if (tags.length >= 10) {
      alert("Maximum 10 tags allowed")
      return
    }
    setTags([...tags, trimmedTag])
    setNewTag("")
  }, [tags, newTag])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove))
  }, [])

  const handleSave = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/clubs/${clubId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      })

      if (response.ok) {
        setOpen(false)
        onUpdateSuccess()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update tags")
      }
    } catch (error) {
      console.error("Error updating tags:", error)
      alert("Failed to update tags. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [clubId, tags, onUpdateSuccess])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Tag className="h-4 w-4 mr-2" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Manage Tags for {clubName}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Add or remove searchable tags for your club</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Current Tags */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Current Tags ({tags.length}/10)</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[60px] p-2.5 sm:p-3 border rounded-lg">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">No tags yet</p>
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="new-tag" className="text-sm">Add New Tag</Label>
            <div className="flex gap-2">
              <Input
                id="new-tag"
                placeholder="e.g., stem, coding"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={30}
                className="h-9 sm:h-10 text-sm"
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim() || tags.length >= 10} className="h-9 sm:h-10 text-sm flex-shrink-0">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tags help students find your club through search
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 sm:pt-4">
            <Button onClick={handleSave} disabled={loading} className="flex-1 h-9 sm:h-10 text-sm">
              {loading ? "Saving..." : "Save Tags"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTags(currentTags)
                setOpen(false)
              }}
              disabled={loading}
              className="h-9 sm:h-10 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
