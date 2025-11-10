"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Crown, AlertTriangle } from "lucide-react"

interface ClaimClubDialogProps {
  clubId: string
  clubName: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  userGrade?: string
  userDepartment?: string
  userBio?: string
  userAvatar?: string
  onClaimSuccess: () => void
}

export function ClaimClubDialog({ 
  clubId, 
  clubName, 
  userId, 
  userName, 
  userEmail, 
  userRole, 
  userGrade, 
  userDepartment, 
  userBio, 
  userAvatar, 
  onClaimSuccess 
}: ClaimClubDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const checkUserStatus = async () => {
    try {
      const response = await fetch(`/api/debug/user-status?userId=${userId}`)
      const data = await response.json()
      setDebugInfo(`User exists in DB: ${data.exists}. ${data.message}`)
    } catch (error) {
      setDebugInfo("Error checking user status")
    }
  }

  const handleClaim = async () => {
    if (!isConfirmed) {
      alert("Please confirm that you are the president of this club")
      return
    }

    setIsLoading(true)
    setDebugInfo("Attempting to claim club...")

    try {
      const response = await fetch(`/api/clubs/${clubId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          confirmed: true,
          userEmail,
          userName,
          userRole,
          userGrade,
          userDepartment,
          userBio,
          userAvatar,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || "Club claimed successfully! You are now the president.")
        setIsOpen(false)
        setIsConfirmed(false)
        onClaimSuccess()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to claim club")
      }
    } catch (error) {
      console.error("Error claiming club:", error)
      alert("Failed to claim club. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default">
          <Crown className="h-4 w-4 mr-2" />
          Claim Club
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Claim {clubName}
          </DialogTitle>
          <DialogDescription>
            By claiming this club, you will become its president and be responsible for managing it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <p>Only claim this club if you are actually the president or have permission to manage it.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Claiming as:</span> {userName}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You will become the president of this club and be able to manage its members and activities.
            </p>
          </div>

          {/* Debug Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Debug Info:</p>
              <Button variant="outline" size="sm" onClick={checkUserStatus}>
                Check User Status
              </Button>
            </div>
            {debugInfo && (
              <p className="text-xs text-gray-600">{debugInfo}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm-president"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="confirm-president"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I confirm that I am the president of this club
              </label>
              <p className="text-xs text-muted-foreground">
                I acknowledge that I have the authority to manage this club and its activities.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              className="flex-1"
              disabled={!isConfirmed || isLoading}
            >
              {isLoading ? "Claiming..." : "Claim Club"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}