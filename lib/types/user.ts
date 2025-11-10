// User-related TypeScript interfaces for the database user repository and service layer

export interface DatabaseUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: 'student' | 'sponsor' | 'admin'
  grade?: string
  department?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserData {
  email: string
  name: string
  avatarUrl?: string
  role?: 'student' | 'sponsor' | 'admin'
  grade?: string
  department?: string
  bio?: string
}

export interface UserUpdateData {
  name?: string
  avatarUrl?: string
  role?: 'student' | 'sponsor' | 'admin'
  grade?: string
  department?: string
  bio?: string
}