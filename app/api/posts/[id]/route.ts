import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { supabase } from '@/lib/supabase'

// DELETE /api/posts/[id] - Delete a post (author or club leadership only)
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

    // Get post details including image URL
    const postQuery = 'SELECT club_id, user_id, image_url FROM posts WHERE id = $1'
    const postResult = await pool.query(postQuery, [postId])

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const post = postResult.rows[0]

    // Check if user is the post author
    const isAuthor = post.user_id === userId

    // Check if user is club leadership (president, vice_president, or officer)
    const leadershipQuery = `
      SELECT role FROM club_members 
      WHERE club_id = $1 AND user_id = $2 
      AND role IN ('president', 'vice_president', 'officer')
    `
    const leadershipResult = await pool.query(leadershipQuery, [post.club_id, userId])
    const isLeadership = leadershipResult.rows.length > 0

    // User must be either the author or club leadership
    if (!isAuthor && !isLeadership) {
      return NextResponse.json(
        { success: false, error: 'Only the post author or club leadership can delete this post' },
        { status: 403 }
      )
    }

    // Delete associated image from storage if it exists
    if (post.image_url) {
      try {
        // Extract filename from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/club-images/[filename]
        const urlParts = post.image_url.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        if (filename) {
          const { error: deleteError } = await supabase.storage
            .from('club-images')
            .remove([filename])
          
          if (deleteError) {
            console.error('Error deleting image from storage:', deleteError)
            // Continue with post deletion even if image deletion fails
          } else {
            console.log(`Successfully deleted image: ${filename}`)
          }
        }
      } catch (imageError) {
        console.error('Error processing image deletion:', imageError)
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete the post (this will cascade delete likes due to foreign key constraints)
    await pool.query('DELETE FROM posts WHERE id = $1', [postId])

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
