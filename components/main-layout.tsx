"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { HomeContent } from "@/components/home-content"
import { ClubsContent } from "@/components/clubs-content"
import { useAuth } from "@/contexts/auth-context"
import { ProfileCreation } from "@/components/profile-creation"
import { LoginScreen } from "@/components/login-screen"

type ActiveSection = "home" | "clubs"

export function MainLayout() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("home")
  const { user, isAuthenticated, isLoading, hasProfile, logout } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Show profile creation if authenticated but no profile
  if (!hasProfile) {
    return <ProfileCreation />
  }

  // Show main app if authenticated and profile exists
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <HomeContent />
      case "clubs":
        return <ClubsContent />
      default:
        return <HomeContent />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        user={user}
        onLogout={logout}
      />
      <main className="pt-14 sm:pt-16">{renderContent()}</main>
    </div>
  )
}
