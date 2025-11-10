import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// PUT /api/users/update - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, role, grade, department, profilePicture, bio } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`)
      values.push(name)
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`)
      values.push(role)
    }
    if (grade !== undefined) {
      updateFields.push(`grade = $${paramIndex++}`)
      values.push(grade)
    }
    if (department !== undefined) {
      updateFields.push(`department = $${paramIndex++}`)
      values.push(department)
    }
    if (profilePicture !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex++}`)
      values.push(profilePicture)
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`)
      values.push(bio)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id) // Add ID as the last parameter

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING id, email, name, avatar_url, role, grade, department, bio, created_at, updated_at`,
      values
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
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}