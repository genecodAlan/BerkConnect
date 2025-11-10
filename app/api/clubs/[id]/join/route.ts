import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/clubs/[id]/join - Join a club
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed type
) {
  try {
    const { id: clubId } = await params // Await params
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if club exists
    const clubQuery = 'SELECT id FROM clubs WHERE id = $1'
    const clubResult = await pool.query(clubQuery, [clubId])

    if (clubResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    // Verify user exists in database
    const userQuery = 'SELECT id FROM users WHERE id = $1'
    const userResult = await pool.query(userQuery, [userId])
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found in database. Please ensure you are logged in properly and try again.' },
        { status: 404 }
      )
    }

    // Check if already a member
    const memberCheck = await pool.query(
      'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, userId]
    )

    if (memberCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already a member of this club' },
        { status: 409 }
      )
    }

    // Add member
    await pool.query(
      'INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, $3)',
      [clubId, userId, 'member']
    )

    return NextResponse.json({
      success: true,
      message: 'Joined club successfully',
    })
  } catch (error) {
    console.error('Error joining club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join club' },
      { status: 500 }
    )
  }
}

// DELETE /api/clubs/[id]/join - Leave a club
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if user is president
    const clubQuery = 'SELECT president_id FROM clubs WHERE id = $1'
    const clubResult = await pool.query(clubQuery, [clubId])

    if (clubResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    if (clubResult.rows[0].president_id === userId) {
      return NextResponse.json(
        { success: false, error: 'President cannot leave club. Transfer presidency first.' },
        { status: 403 }
      )
    }

    // Remove member
    const result = await pool.query(
      'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, userId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this club' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Left club successfully',
    })
  } catch (error) {
    console.error('Error leaving club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to leave club' },
      { status: 500 }
    )
  }
}

