"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginScreen() {
  const { login, isLoading } = useAuth()

  const handleMicrosoftLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-primary rounded-xl">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">SchoolConnect</h1>
            </div>
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed px-2 sm:px-0">
              Connect with your school community. Share updates, join clubs, and stay informed about campus life.
            </p>
          </div>

          {/* Feature highlights - Hidden on small mobile */}
          <div className="hidden sm:grid gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Connect with Classmates</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Build your school network</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Join Clubs & Activities</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Discover new interests</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Stay Updated</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Never miss important announcements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-1.5 sm:space-y-2 px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Sign in with your school Microsoft account to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <Button 
                onClick={handleMicrosoftLogin} 
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium" 
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                </svg>
                {isLoading ? "Signing in..." : "Continue with Microsoft"}
              </Button>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
