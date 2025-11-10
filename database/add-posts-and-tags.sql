-- Migration: Add posts and tags tables to clubs schema
-- Run this to add the missing tables for club posts and tags

-- Club tags table (for searchable tags)
CREATE TABLE IF NOT EXISTS club_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    UNIQUE(club_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_club_tags_club_id ON club_tags(club_id);
CREATE INDEX IF NOT EXISTS idx_club_tags_tag ON club_tags(tag);

-- Club posts table (for announcements and updates)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_club_id ON posts(club_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Posts and tags tables created successfully!';
END $$;
