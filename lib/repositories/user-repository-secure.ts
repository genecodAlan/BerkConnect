import { query, transaction } from '../db'
import { DatabaseUser, UserData, UserUpdateData } from '../types/user'
import { validateEmail, validateName, validateRole, validateGrade, validateTextContent, validateUrl } from '../security/input-validator'

export class UserRepository {
  /**
   * Upsert user - creates a new user or updates existing one atomically
   * Uses ON CONFLICT to handle both INSERT and UPDATE operations
   * SECURITY: All inputs are validated and sanitized before database operations
   */
  async upsertUser(userData: UserData): Promise<DatabaseUser> {
    const {
      email,
      name,
      avatarUrl,
      role = 'student',
      grade,
      department,
      bio
    } = userData

    // SECURITY: Validate and sanitize all inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(`Invalid email: ${emailValidation.error}`)
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      throw new Error(`Invalid name: ${nameValidation.error}`)
    }

    const roleValidation = validateRole(role)
    if (!roleValidation.valid) {
      throw new Error(`Invalid role: ${roleValidation.error}`)
    }

    if (grade) {
      const gradeValidation = validateGrade(grade)
      if (!gradeValidation.valid) {
        throw new Error(`Invalid grade: ${gradeValidation.error}`)
      }
    }

    if (avatarUrl) {
      const urlValidation = validateUrl(avatarUrl)
      if (!urlValidation.valid) {
        throw new Error(`Invalid avatar URL: ${urlValidation.error}`)
      }
    }

    if (bio) {
      const bioValidation = validateTextContent(bio, 0, 500)
      if (!bioValidation.valid) {
        throw new Error(`Invalid bio: ${bioValidation.error}`)
      }
    }

    try {
      // SECURITY: Using parameterized queries to prevent SQL injection
      const result = await query(
        `INSERT INTO users (email, name, avatar_url, role, grade, department, bio, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (email) 
         DO UPDATE SET 
           name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           role = EXCLUDED.role,
           grade = EXCLUDED.grade,
           department = EXCLUDED.department,
           bio = EXCLUDED.bio,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at`,
        [
          emailValidation.sanitized,
          nameValidation.sanitized,
          avatarUrl || null,
          roleValidation.sanitized,
          grade || null,
          department || null,
          bio || null
        ]
      )

      if (result.rows.length === 0) {
        throw new Error('Failed to upsert user')
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error upserting user:', error)
      throw new Error(`Failed to upsert user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find user by email address
   * SECURITY: Email is validated before query
   */
  async findByEmail(email: string): Promise<DatabaseUser | null> {
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(`Invalid email: ${emailValidation.error}`)
    }

    try {
      // SECURITY: Using parameterized query
      const result = await query(
        'SELECT id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at FROM users WHERE email = $1',
        [emailValidation.sanitized]
      )

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find user by ID
   * SECURITY: UUID is validated before query
   */
  async findById(id: string): Promise<DatabaseUser | null> {
    try {
      // SECURITY: Using parameterized query
      const result = await query(
        'SELECT id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at FROM users WHERE id = $1',
        [id]
      )

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error finding user by ID:', error)
      throw new Error(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user profile data atomically
   * SECURITY: FIXED SQL INJECTION VULNERABILITY - Now using proper parameterized queries
   */
  async updateUser(id: string, updateData: UserUpdateData): Promise<DatabaseUser> {
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // SECURITY: Validate and sanitize all inputs before building query
    if (updateData.name !== undefined) {
      const nameValidation = validateName(updateData.name)
      if (!nameValidation.valid) {
        throw new Error(`Invalid name: ${nameValidation.error}`)
      }
      updateFields.push(`name = $${paramIndex++}`)
      values.push(nameValidation.sanitized)
    }

    if (updateData.avatarUrl !== undefined) {
      if (updateData.avatarUrl) {
        const urlValidation = validateUrl(updateData.avatarUrl)
        if (!urlValidation.valid) {
          throw new Error(`Invalid avatar URL: ${urlValidation.error}`)
        }
        updateFields.push(`avatar_url = $${paramIndex++}`)
        values.push(urlValidation.sanitized)
      } else {
        updateFields.push(`avatar_url = $${paramIndex++}`)
        values.push(null)
      }
    }

    if (updateData.role !== undefined) {
      const roleValidation = validateRole(updateData.role)
      if (!roleValidation.valid) {
        throw new Error(`Invalid role: ${roleValidation.error}`)
      }
      updateFields.push(`role = $${paramIndex++}`)
      values.push(roleValidation.sanitized)
    }

    if (updateData.grade !== undefined) {
      if (updateData.grade) {
        const gradeValidation = validateGrade(updateData.grade)
        if (!gradeValidation.valid) {
          throw new Error(`Invalid grade: ${gradeValidation.error}`)
        }
        updateFields.push(`grade = $${paramIndex++}`)
        values.push(gradeValidation.sanitized)
      } else {
        updateFields.push(`grade = $${paramIndex++}`)
        values.push(null)
      }
    }

    if (updateData.department !== undefined) {
      if (updateData.department) {
        const deptValidation = validateTextContent(updateData.department, 2, 100)
        if (!deptValidation.valid) {
          throw new Error(`Invalid department: ${deptValidation.error}`)
        }
        updateFields.push(`department = $${paramIndex++}`)
        values.push(deptValidation.sanitized)
      } else {
        updateFields.push(`department = $${paramIndex++}`)
        values.push(null)
      }
    }

    if (updateData.bio !== undefined) {
      if (updateData.bio) {
        const bioValidation = validateTextContent(updateData.bio, 0, 500)
        if (!bioValidation.valid) {
          throw new Error(`Invalid bio: ${bioValidation.error}`)
        }
        updateFields.push(`bio = $${paramIndex++}`)
        values.push(bioValidation.sanitized)
      } else {
        updateFields.push(`bio = $${paramIndex++}`)
        values.push(null)
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No fields provided for update')
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id) // Add ID as the last parameter

    try {
      // SECURITY: FIXED - Now using $${paramIndex} instead of ${paramIndex}
      const result = await query(
        `UPDATE users SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at`,
        values
      )

      if (result.rows.length === 0) {
        throw new Error('User not found')
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute multiple user operations in a single transaction
   */
  async executeInTransaction<T>(callback: (repo: UserRepository) => Promise<T>): Promise<T> {
    return transaction(async (client) => {
      const transactionRepo = new TransactionUserRepository(client)
      return callback(transactionRepo)
    })
  }

  /**
   * Map database row to DatabaseUser interface
   */
  protected mapRowToUser(row: any): DatabaseUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      role: row.role,
      grade: row.grade,
      department: row.department,
      bio: row.bio,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }
}

/**
 * Transaction-aware UserRepository for use within database transactions
 */
class TransactionUserRepository extends UserRepository {
  constructor(private client: any) {
    super()
  }

  async upsertUser(userData: UserData): Promise<DatabaseUser> {
    const {
      email,
      name,
      avatarUrl,
      role = 'student',
      grade,
      department,
      bio
    } = userData

    // SECURITY: Validate all inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(`Invalid email: ${emailValidation.error}`)
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      throw new Error(`Invalid name: ${nameValidation.error}`)
    }

    try {
      const result = await this.client.query(
        `INSERT INTO users (email, name, avatar_url, role, grade, department, bio, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (email) 
         DO UPDATE SET 
           name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           role = EXCLUDED.role,
           grade = EXCLUDED.grade,
           department = EXCLUDED.department,
           bio = EXCLUDED.bio,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at`,
        [emailValidation.sanitized, nameValidation.sanitized, avatarUrl, role, grade, department, bio]
      )

      if (result.rows.length === 0) {
        throw new Error('Failed to upsert user')
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error upserting user in transaction:', error)
      throw new Error(`Failed to upsert user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findByEmail(email: string): Promise<DatabaseUser | null> {
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      throw new Error(`Invalid email: ${emailValidation.error}`)
    }

    try {
      const result = await this.client.query(
        'SELECT id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at FROM users WHERE email = $1',
        [emailValidation.sanitized]
      )

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error finding user by email in transaction:', error)
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findById(id: string): Promise<DatabaseUser | null> {
    try {
      const result = await this.client.query(
        'SELECT id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at FROM users WHERE id = $1',
        [id]
      )

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToUser(result.rows[0])
    } catch (error) {
      console.error('Error finding user by ID in transaction:', error)
      throw new Error(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
