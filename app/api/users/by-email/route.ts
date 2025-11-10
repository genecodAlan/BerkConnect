import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/users/by-email - Get user by email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'SELECT id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error('Error finding user by email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to find user' },
      { status: 500 }
    )
  }
}