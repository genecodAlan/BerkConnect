import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

// POST /api/users/sync - Sync user from localStorage to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, role, grade, department, bio, profilePicture } = body

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Use email-based upsert for simplicity
    const result = await pool.query(
      `INSERT INTO users (id, email, name, role, grade, department, bio, avatar_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (email) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         role = COALESCE(EXCLUDED.role, users.role),
         grade = COALESCE(EXCLUDED.grade, users.grade),
         department = COALESCE(EXCLUDED.department, users.department),
         bio = COALESCE(EXCLUDED.bio, users.bio),
         avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, email, name`,
      [id || randomUUID(), email, name, role || 'student', grade, department, bio, profilePicture]
    )
    
    return NextResponse.json({
      success: true,
      message: result.rowCount === 1 ? 'User synced successfully' : 'User updated successfully',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}