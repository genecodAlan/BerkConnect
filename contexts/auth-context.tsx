"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { PublicClientApplication, AccountInfo, AuthenticationResult } from "@azure/msal-browser"
import { msalConfig, loginRequest, isBerkeleyPrepEmail, UserProfile } from "@/lib/auth-config"
import { DEMO_MODE, DEMO_USER } from "@/lib/demo-mode"
import { debugMSAL } from "@/lib/debug-msal"
// Removed server-side imports to prevent bundling issues

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  hasProfile: boolean
  login: () => Promise<void>
  logout: () => void
  createProfile: (profileData: Partial<UserProfile>) => Promise<void>
  getUserFromDatabase: (email: string) => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig)

// Use API calls instead of direct service imports

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [isInteractionInProgress, setIsInteractionInProgress] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitialized) {
      return
    }

    // Demo mode - skip Azure authentication
    if (DEMO_MODE) {
      setUser(DEMO_USER)
      setIsAuthenticated(true)
      setHasProfile(true)
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    // Check if Azure client ID is configured
    if (!process.env.NEXT_PUBLIC_AZURE_CLIENT_ID) {
      console.error("Azure Client ID not configured. Please set NEXT_PUBLIC_AZURE_CLIENT_ID in your .env.local file")
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    // Initialize MSAL and check authentication status
    const initializeAuth = async () => {
      try {
        await msalInstance.initialize()
        
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          console.log("Found existing account, attempting silent authentication")
          setIsInteractionInProgress(true)
          await handleAuthSuccess(accounts[0])
          setIsInteractionInProgress(false)
        } else {
          setIsLoading(false)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error("Failed to initialize MSAL:", error)
        setIsLoading(false)
        setIsInteractionInProgress(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [isInitialized])

  const handleAuthSuccess = async (account: AccountInfo) => {
    try {
      // Get user info from Microsoft Graph
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      })

      if (response) {
        try {
          // Debug: Log account info
          debugMSAL.logAccountInfo(account)
          
          const userInfo = await getUserInfo(response.accessToken)
          
          // Check if userInfo has required properties
          if (!userInfo || !userInfo.email) {
            console.error("Failed to get user info from Microsoft Graph")
            setIsLoading(false)
            return
          }
          
          // Check if email is from Berkeley Prep
          if (!isBerkeleyPrepEmail(userInfo.email)) {
            alert("Only Berkeley Prep School email addresses are allowed to access this application.")
            logout()
            return
          }

          // Atomic authentication and registration: immediately upsert user to database
          await upsertUserToDatabase(userInfo.email, userInfo.displayName || userInfo.name || "", userInfo.picture)
          
          // Retrieve the user from database to get complete profile
          const databaseUser = await getUserFromDatabase(userInfo.email)
          if (databaseUser) {
            setUser(databaseUser)
            setIsAuthenticated(true)
            // User always has a profile after authentication since we create it in the database
            setHasProfile(true)
          } else {
            throw new Error("Failed to retrieve user from database after creation")
          }
        } catch (graphError) {
          console.error("Microsoft Graph API error:", graphError)
          
          // Fallback: try to get basic info from the account
          if (account.username) {
            console.log("Using fallback account info:", account)
            
            // Check if email is from Berkeley Prep
            if (!isBerkeleyPrepEmail(account.username)) {
              alert("Only Berkeley Prep School email addresses are allowed to access this application.")
              logout()
              return
            }

            try {
              // Atomic authentication and registration with fallback data
              await upsertUserToDatabase(account.username, account.name || "", undefined)
              
              // Retrieve the user from database
              const databaseUser = await getUserFromDatabase(account.username)
              if (databaseUser) {
                setUser(databaseUser)
                setIsAuthenticated(true)
                // User always has a profile after authentication since we create it in the database
                setHasProfile(true)
              } else {
                throw new Error("Failed to retrieve user from database after creation")
              }
            } catch (dbError) {
              console.error("Database error during fallback authentication:", dbError)
              
              // More specific error message
              if (dbError instanceof Error && dbError.message.includes('Failed to sync user')) {
                alert("Failed to register user in database. Please check your connection and try again.")
              } else {
                alert("Failed to register user. Please try again or contact support.")
              }
              setIsLoading(false)
              return
            }
          } else {
            console.error("No fallback email available")
            setIsLoading(false)
          }
        }
      }
    } catch (error) {
      console.error("Error handling auth success:", error)
      
      // Handle specific MSAL errors
      if (error instanceof Error && error.message.includes('interaction_in_progress')) {
        console.log("Interaction already in progress, will retry...")
        // Don't show alert for this error, just log it
      } else {
        alert("Authentication failed. Please try again or contact support.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInfo = async (accessToken: string) => {
    try {
      // Try to get user info with email field explicitly requested
      const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,email", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`)
      }
      
      const userInfo = await response.json()
      console.log("Microsoft Graph API response:", userInfo) // Debug log
      
      // Check for email in various possible fields
      const email = userInfo.mail || userInfo.email || userInfo.userPrincipalName
      
      if (!userInfo || !email) {
        console.error("User info received:", userInfo)
        throw new Error("Microsoft Graph API returned incomplete user information. Email field not found.")
      }
      
      // Return userInfo with email field normalized
      return {
        ...userInfo,
        email: email
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      throw error
    }
  }

  const login = async () => {
    try {
      // Prevent multiple simultaneous login attempts
      if (isInteractionInProgress) {
        console.log("Login interaction already in progress, skipping...")
        return
      }

      setIsLoading(true)
      setIsInteractionInProgress(true)
      
      // Demo mode - simulate login
      if (DEMO_MODE) {
        setUser(DEMO_USER)
        setIsAuthenticated(true)
        setHasProfile(true)
        setIsLoading(false)
        setIsInteractionInProgress(false)
        return
      }
      
      // Check if user is already signed in
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        console.log("User already signed in, using existing account")
        await handleAuthSuccess(accounts[0])
        setIsInteractionInProgress(false)
        return
      }
      
      // Ensure MSAL is initialized
      await msalInstance.initialize()
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest)
      if (response.account) {
        await handleAuthSuccess(response.account)
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
    } finally {
      setIsInteractionInProgress(false)
    }
  }

  const logout = () => {
    if (isInteractionInProgress) {
      console.log("Interaction in progress, cannot logout now")
      return
    }
    
    msalInstance.logout()
    setUser(null)
    setIsAuthenticated(false)
    setHasProfile(false)
    setIsInteractionInProgress(false)
  }

  const getUserFromDatabase = async (email: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch('/api/users/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      if (!data.success || !data.user) {
        return null
      }

      const user = data.user
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        grade: user.grade,
        department: user.department,
        profilePicture: user.avatar_url,
        bio: user.bio,
        interests: [], // Not stored in database yet
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      }
    } catch (error) {
      console.error("Error retrieving user from database:", error)
      return null
    }
  }

  const upsertUserToDatabase = async (email: string, name: string, avatarUrl?: string): Promise<void> => {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          profilePicture: avatarUrl,
          role: 'student'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Sync API error:', errorData)
        throw new Error(errorData.error || 'Failed to sync user')
      }
      
      const result = await response.json()
      console.log('User sync successful:', result)
    } catch (error) {
      console.error("Error upserting user to database:", error)
      throw new Error(`Database registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const createProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error("No authenticated user found")
      }

      // Update existing user profile via API
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profileData.name || user.name,
          role: profileData.role || user.role,
          grade: profileData.grade,
          department: profileData.department,
          profilePicture: profileData.profilePicture,
          bio: profileData.bio,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      const updatedUser = data.user
      
      // Convert to UserProfile format
      const updatedProfile: UserProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        grade: updatedUser.grade,
        department: updatedUser.department,
        profilePicture: updatedUser.avatar_url,
        bio: updatedUser.bio,
        interests: profileData.interests || user.interests || [],
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at),
      }
      
      setUser(updatedProfile)
      setHasProfile(true)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasProfile,
    login,
    logout,
    createProfile,
    getUserFromDatabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
