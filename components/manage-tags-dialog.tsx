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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags for {clubName}</DialogTitle>
          <DialogDescription>Add or remove searchable tags for your club</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Tags */}
          <div className="space-y-2">
            <Label>Current Tags ({tags.length}/10)</Label>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tags yet</p>
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div className="space-y-2">
            <Label htmlFor="new-tag">Add New Tag</Label>
            <div className="flex gap-2">
              <Input
                id="new-tag"
                placeholder="e.g., stem, coding, beginner-friendly"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={30}
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim() || tags.length >= 10}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tags help students find your club through search
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Tags"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTags(currentTags)
                setOpen(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
