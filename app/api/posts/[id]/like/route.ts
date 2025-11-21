import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/posts/[id]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const checkQuery = 'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2'
    const existing = await pool.query(checkQuery, [postId, userId])

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Post already liked' },
        { status: 400 }
      )
    }

    // Add like
    await pool.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
      [postId, userId]
    )

    // Get updated like count
    const countQuery = 'SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = $1'
    const countResult = await pool.query(countQuery, [postId])
    const likeCount = countResult.rows[0].count

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount
    })
  } catch (error) {
    console.error('Error liking post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Remove like
    await pool.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    // Get updated like count
    const countQuery = 'SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = $1'
    const countResult = await pool.query(countQuery, [postId])
    const likeCount = countResult.rows[0].count

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount
    })
  } catch (error) {
    console.error('Error unliking post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    )
  }
}
