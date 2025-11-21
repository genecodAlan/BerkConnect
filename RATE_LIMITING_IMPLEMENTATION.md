# Rate Limiting & Security Implementation

## Overview
Implemented comprehensive rate limiting to prevent post spam attacks and added automatic image cleanup when posts are deleted.

## Changes Made

### 1. Enhanced Rate Limiting System (`lib/security/input-validator.ts`)

Added `checkPostRateLimit()` function with multi-tier protection:
- **Per Minute**: 5 posts maximum
- **Per Hour**: 20 posts maximum  
- **Per Day**: 50 posts maximum

Each tier tracks independently and provides specific error messages with countdown timers.

### 2. Post Creation Protection (`app/api/clubs/[id]/posts/route.ts`)

- Applied post-specific rate limiting to POST endpoint
- Combines IP address + user ID for tracking
- Returns 429 status with detailed rate limit headers
- Provides remaining quota information in response

### 3. Image Upload Protection (`app/api/upload/route.ts`)

- Wrapped upload handler with `withRateLimit` middleware
- Limits: 10 uploads per minute per IP/user
- Prevents image spam attacks

### 4. Client-Side Throttling (`components/create-post-dialog.tsx`)

- Added 15-second cooldown after successful post
- Visual countdown timer in UI
- Disabled submit button during cooldown
- Enhanced error messages showing remaining quotas

### 5. Image Cleanup on Post Deletion (`app/api/posts/[id]/route.ts`)

- Automatically deletes images from Supabase storage when post is deleted
- Extracts filename from image URL
- Graceful error handling (continues post deletion even if image deletion fails)
- Prevents orphaned images in storage

## Rate Limit Configuration

```typescript
Post Creation:
- 5 posts/minute
- 20 posts/hour
- 50 posts/day

Image Upload:
- 10 uploads/minute
- 100 uploads/hour (via existing middleware)

Client Cooldown:
- 15 seconds between posts
```

## Security Benefits

1. **Spam Prevention**: Multi-tier limits prevent rapid-fire post abuse
2. **Resource Protection**: Upload limits prevent storage abuse
3. **User Experience**: Clear error messages and countdown timers
4. **Storage Efficiency**: Automatic cleanup prevents wasted storage space
5. **Graceful Degradation**: System continues working even if cleanup fails

## Testing Recommendations

1. **Rate Limit Testing**: Try creating 6 posts in quick succession
2. **Cooldown Testing**: Verify 15-second timer works correctly
3. **Image Deletion**: Delete a post with an image and verify storage cleanup
4. **Error Messages**: Verify user-friendly rate limit messages appear
5. **Multi-User**: Test that limits are per-user, not global

## Response Headers

Rate-limited requests return these headers:
- `X-RateLimit-Remaining-Minute`: Posts remaining this minute
- `X-RateLimit-Remaining-Hour`: Posts remaining this hour
- `X-RateLimit-Remaining-Day`: Posts remaining this day
- `Retry-After`: Seconds until next allowed request

## Notes

- Rate limits are stored in-memory (resets on server restart)
- For production, consider Redis for persistent rate limiting
- Image deletion is best-effort (won't block post deletion)
- Cleanup runs every 5 minutes to free memory
