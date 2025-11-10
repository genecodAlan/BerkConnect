import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// PUT /api/clubs/[id]/update - Update club information (leadership only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const body = await request.json()
    const { description, category, meetingTime, location, imageUrl } = body

    // Validate required fields
    if (!description || !category) {
      return NextResponse.json(
        { success: false, error: 'Description and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['academic', 'arts', 'sports', 'technology', 'service', 'hobby']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Check if club exists
    const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId])
    if (clubCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    // Update club
    const updateQuery = `
      UPDATE clubs 
      SET 
        description = $1,
        category = $2,
        meeting_time = $3,
        location = $4,
        image_url = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `

    const result = await pool.query(updateQuery, [
      description,
      category,
      meetingTime,
      location,
      imageUrl,
      clubId,
    ])

    return NextResponse.json({
      success: true,
      message: 'Club updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update club' },
      { status: 500 }
    )
  }
}
