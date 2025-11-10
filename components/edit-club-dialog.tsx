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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Upload, X } from "lucide-react"

interface EditClubDialogProps {
  clubId: string
  clubName: string
  currentDescription: string
  currentCategory: string
  currentMeetingTime: string | null
  currentLocation: string | null
  currentImageUrl: string | null
  onUpdateSuccess: () => void
}

export const EditClubDialog = memo(function EditClubDialog({
  clubId,
  clubName,
  currentDescription,
  currentCategory,
  currentMeetingTime,
  currentLocation,
  currentImageUrl,
  onUpdateSuccess,
}: EditClubDialogProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [location, setLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDescription(currentDescription)
      setCategory(currentCategory)
      setMeetingTime(currentMeetingTime || "")
      setLocation(currentLocation || "")
      setImageUrl(currentImageUrl || "")
      setImagePreview(currentImageUrl)
      setSelectedImage(null)
    }
  }, [open, currentDescription, currentCategory, currentMeetingTime, currentLocation, currentImageUrl])

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }
      setSelectedImage(file)
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
    setImageUrl("")
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      alert("Description is required")
      return
    }

    setLoading(true)

    try {
      let finalImageUrl = imageUrl

      // Upload new image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append("file", selectedImage)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          finalImageUrl = uploadData.data.url
        } else {
          alert("Failed to upload image")
          setLoading(false)
          return
        }
      }

      // Update club
      const response = await fetch(`/api/clubs/${clubId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          category,
          meetingTime: meetingTime || null,
          location: location || null,
          imageUrl: finalImageUrl || null,
        }),
      })

      if (response.ok) {
        setOpen(false)
        onUpdateSuccess()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update club")
      }
    } catch (error) {
      console.error("Error updating club:", error)
      alert("Failed to update club. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [clubId, description, category, meetingTime, location, imageUrl, selectedImage, onUpdateSuccess])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Edit Club Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {clubName}</DialogTitle>
          <DialogDescription>Update club information and details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your club..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="hobby">Hobby</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Time */}
          <div className="space-y-2">
            <Label htmlFor="meeting-time">Meeting Time</Label>
            <Input
              id="meeting-time"
              placeholder="e.g., Tuesdays 3:30 PM"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Room 204"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="club-image">Club Image</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="club-image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="club-image" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload club image</span>
                    <span className="text-xs text-muted-foreground">Max 5MB</span>
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
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Club"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
