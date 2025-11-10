import { UserRepository } from '../repositories/user-repository'
import { DatabaseUser, UserData, UserUpdateData } from '../types/user'

export interface UserServiceConfig {
  allowedEmailDomains?: string[]
  requireEmailDomain?: boolean
}

export class UserService {
  private userRepository: UserRepository
  private config: UserServiceConfig

  constructor(config: UserServiceConfig = {}) {
    this.userRepository = new UserRepository()
    this.config = {
      allowedEmailDomains: ['berkeleyprep.org', 'school.edu'], // Default Berkeley Prep domains
      requireEmailDomain: true,
      ...config
    }
  }

  /**
   * Create or update user with validation
   */
  async upsertUser(userData: UserData): Promise<DatabaseUser> {
    // Validate user data
    this.validateUserData(userData)

    try {
      return await this.userRepository.upsertUser(userData)
    } catch (error) {
      console.error('UserService: Failed to upsert user:', error)
      throw new Error(`User registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find user by email with validation
   */
  async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    try {
      return await this.userRepository.findByEmail(email)
    } catch (error) {
      console.error('UserService: Failed to find user by email:', error)
      throw new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<DatabaseUser | null> {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Invalid user ID')
    }

    try {
      return await this.userRepository.findById(id)
    } catch (error) {
      console.error('UserService: Failed to find user by ID:', error)
      throw new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user profile with validation
   */
  async updateUserProfile(id: string, updateData: UserUpdateData): Promise<DatabaseUser> {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Invalid user ID')
    }

    // Validate update data
    this.validateUserUpdateData(updateData)

    try {
      return await this.userRepository.updateUser(id, updateData)
    } catch (error) {
      console.error('UserService: Failed to update user profile:', error)
      throw new Error(`Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if user exists by email
   */
  async userExists(email: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmail(email)
      return user !== null
    } catch (error) {
      console.error('UserService: Error checking if user exists:', error)
      return false
    }
  }

  /**
   * Validate user data for creation/update
   */
  private validateUserData(userData: UserData): void {
    // Validate required fields
    if (!userData.email || typeof userData.email !== 'string' || userData.email.trim().length === 0) {
      throw new Error('Email is required')
    }

    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
      throw new Error('Name is required')
    }

    // Validate email format
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format')
    }

    // Validate email domain for Berkeley Prep
    if (this.config.requireEmailDomain && !this.isValidEmailDomain(userData.email)) {
      const allowedDomains = this.config.allowedEmailDomains?.join(', ') || 'berkeleyprep.org'
      throw new Error(`Email must be from an allowed domain: ${allowedDomains}`)
    }

    // Validate role if provided
    if (userData.role && !['student', 'sponsor', 'admin'].includes(userData.role)) {
      throw new Error('Invalid role. Must be student, sponsor, or admin')
    }

    // Validate name length
    if (userData.name.trim().length > 255) {
      throw new Error('Name must be 255 characters or less')
    }

    // Validate avatar URL if provided
    if (userData.avatarUrl && !this.isValidUrl(userData.avatarUrl)) {
      throw new Error('Invalid avatar URL format')
    }

    // Validate grade if provided
    if (userData.grade && userData.grade.length > 20) {
      throw new Error('Grade must be 20 characters or less')
    }

    // Validate department if provided
    if (userData.department && userData.department.length > 100) {
      throw new Error('Department must be 100 characters or less')
    }

    // Validate bio if provided
    if (userData.bio && userData.bio.length > 1000) {
      throw new Error('Bio must be 1000 characters or less')
    }
  }

  /**
   * Validate user update data
   */
  private validateUserUpdateData(updateData: UserUpdateData): void {
    // Validate name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name || typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
        throw new Error('Name cannot be empty')
      }
      if (updateData.name.trim().length > 255) {
        throw new Error('Name must be 255 characters or less')
      }
    }

    // Validate role if provided
    if (updateData.role && !['student', 'sponsor', 'admin'].includes(updateData.role)) {
      throw new Error('Invalid role. Must be student, sponsor, or admin')
    }

    // Validate avatar URL if provided
    if (updateData.avatarUrl !== undefined && updateData.avatarUrl && !this.isValidUrl(updateData.avatarUrl)) {
      throw new Error('Invalid avatar URL format')
    }

    // Validate grade if provided
    if (updateData.grade !== undefined && updateData.grade && updateData.grade.length > 20) {
      throw new Error('Grade must be 20 characters or less')
    }

    // Validate department if provided
    if (updateData.department !== undefined && updateData.department && updateData.department.length > 100) {
      throw new Error('Department must be 100 characters or less')
    }

    // Validate bio if provided
    if (updateData.bio !== undefined && updateData.bio && updateData.bio.length > 1000) {
      throw new Error('Bio must be 1000 characters or less')
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate email domain against allowed domains
   */
  private isValidEmailDomain(email: string): boolean {
    if (!this.config.allowedEmailDomains || this.config.allowedEmailDomains.length === 0) {
      return true
    }

    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) {
      return false
    }

    return this.config.allowedEmailDomains.some(allowedDomain => 
      domain === allowedDomain.toLowerCase()
    )
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      // Also allow relative URLs for internal assets
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
    }
  }

  /**
   * Execute operations within a transaction
   */
  async executeInTransaction<T>(callback: (service: UserService) => Promise<T>): Promise<T> {
    return this.userRepository.executeInTransaction(async (transactionRepo) => {
      // Create a service instance that uses the transaction repository
      const transactionService = new UserService(this.config)
      transactionService.userRepository = transactionRepo
      return callback(transactionService)
    })
  }
}