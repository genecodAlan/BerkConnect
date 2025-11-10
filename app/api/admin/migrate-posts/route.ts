import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/admin/migrate-posts - Create posts and tags tables
export async function POST(request: NextRequest) {
  try {
    // Create club_tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS club_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        tag VARCHAR(50) NOT NULL,
        UNIQUE(club_id, tag)
      )
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_club_tags_club_id ON club_tags(club_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_club_tags_tag ON club_tags(tag)
    `)

    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_club_id ON posts(club_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)
    `)

    return NextResponse.json({
      success: true,
      message: 'Posts and tags tables created successfully!',
    })
  } catch (error) {
    console.error('Error creating tables:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
