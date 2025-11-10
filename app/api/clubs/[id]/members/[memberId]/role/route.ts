import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// PUT /api/clubs/[id]/members/[memberId]/role - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: clubId, memberId } = await params
    const body = await request.json()
    const { role, updatedBy } = body

    if (!role || !updatedBy) {
      return NextResponse.json(
        { success: false, error: 'Role and updatedBy are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['member', 'officer', 'vice_president', 'president']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Verify the updater is the president of the club
    const presidentQuery = 'SELECT president_id FROM clubs WHERE id = $1'
    const presidentResult = await pool.query(presidentQuery, [clubId])
    
    if (presidentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    if (presidentResult.rows[0].president_id !== updatedBy) {
      return NextResponse.json(
        { success: false, error: 'Only the club president can update member roles' },
        { status: 403 }
      )
    }

    // If promoting to president, we need to handle the transfer
    if (role === 'president') {
      await pool.query('BEGIN')
      
      try {
        // Update the old president to officer
        await pool.query(
          'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
          ['officer', clubId, updatedBy]
        )
        
        // Update the new president
        await pool.query(
          'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
          ['president', clubId, memberId]
        )
        
        // Update the club's president_id
        await pool.query(
          'UPDATE clubs SET president_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [memberId, clubId]
        )
        
        await pool.query('COMMIT')
      } catch (error) {
        await pool.query('ROLLBACK')
        throw error
      }
    } else {
      // Regular role update
      await pool.query(
        'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
        [role, clubId, memberId]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully',
    })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}