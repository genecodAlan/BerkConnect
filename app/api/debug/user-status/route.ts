import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/debug/user-status?userId=xxx - Check if user exists in database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if user exists in database
    const userQuery = 'SELECT id, email, name, role, created_at FROM users WHERE id = $1'
    const userResult = await pool.query(userQuery, [userId])
    
    const exists = userResult.rows.length > 0
    const userData = exists ? userResult.rows[0] : null

    return NextResponse.json({
      success: true,
      userId,
      exists,
      userData,
      message: exists ? 'User found in database' : 'User not found in database'
    })
  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check user status' },
      { status: 500 }
    )
  }
}