/**
 * Input Validation and Sanitization Utilities
 * Protects against XSS, SQL Injection, and other injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all script tags and dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  
  // Simple HTML sanitization - remove all tags except safe ones
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/<(?!\/?(?:b|i|em|strong|a|p|br)\b)[^>]+>/gi, '')
}

/**
 * Sanitize plain text - strips all HTML and dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  // Remove all HTML tags and trim
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
  if (!email) {
    return { valid: false, sanitized: '', error: 'Email is required' }
  }

  const sanitized = sanitizeText(email.trim().toLowerCase())
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid email format' }
  }

  if (sanitized.length > 255) {
    return { valid: false, sanitized, error: 'Email too long' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate and sanitize UUID
 */
export function validateUuid(uuid: string): { valid: boolean; sanitized: string; error?: string } {
  if (!uuid) {
    return { valid: false, sanitized: '', error: 'UUID is required' }
  }

  const sanitized = sanitizeText(uuid.trim())
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid UUID format' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate and sanitize user name
 */
export function validateName(name: string): { valid: boolean; sanitized: string; error?: string } {
  if (!name) {
    return { valid: false, sanitized: '', error: 'Name is required' }
  }

  const sanitized = sanitizeText(name.trim())

  if (sanitized.length < 2) {
    return { valid: false, sanitized, error: 'Name must be at least 2 characters' }
  }

  if (sanitized.length > 100) {
    return { valid: false, sanitized, error: 'Name must be less than 100 characters' }
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Name contains invalid characters' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate and sanitize text content (posts, descriptions, etc.)
 */
export function validateTextContent(
  content: string,
  minLength: number = 1,
  maxLength: number = 5000
): { valid: boolean; sanitized: string; error?: string } {
  if (!content) {
    return { valid: false, sanitized: '', error: 'Content is required' }
  }

  const sanitized = sanitizeText(content.trim())

  if (sanitized.length < minLength) {
    return { valid: false, sanitized, error: `Content must be at least ${minLength} characters` }
  }

  if (sanitized.length > maxLength) {
    return { valid: false, sanitized, error: `Content must be less than ${maxLength} characters` }
  }

  return { valid: true, sanitized }
}

/**
 * Validate and sanitize tags
 */
export function validateTag(tag: string): { valid: boolean; sanitized: string; error?: string } {
  if (!tag) {
    return { valid: false, sanitized: '', error: 'Tag is required' }
  }

  const sanitized = sanitizeText(tag.trim().toLowerCase())

  if (sanitized.length < 2) {
    return { valid: false, sanitized, error: 'Tag must be at least 2 characters' }
  }

  if (sanitized.length > 30) {
    return { valid: false, sanitized, error: 'Tag must be less than 30 characters' }
  }

  // Only allow alphanumeric, hyphens, and underscores
  const tagRegex = /^[a-z0-9-_]+$/
  if (!tagRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Tag can only contain letters, numbers, hyphens, and underscores' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; sanitized: string; error?: string } {
  if (!url) {
    return { valid: true, sanitized: '', error: undefined } // URL is optional
  }

  const sanitized = sanitizeText(url.trim())

  try {
    const urlObj = new URL(sanitized)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, sanitized, error: 'Only HTTP and HTTPS URLs are allowed' }
    }

    if (sanitized.length > 2048) {
      return { valid: false, sanitized, error: 'URL too long' }
    }

    return { valid: true, sanitized }
  } catch {
    return { valid: false, sanitized, error: 'Invalid URL format' }
  }
}

/**
 * Validate role
 */
export function validateRole(role: string): { valid: boolean; sanitized: string; error?: string } {
  const validRoles = ['student', 'sponsor', 'admin', 'president', 'vice_president', 'officer', 'member']
  const sanitized = sanitizeText(role.trim().toLowerCase())

  if (!validRoles.includes(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid role' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate category
 */
export function validateCategory(category: string): { valid: boolean; sanitized: string; error?: string } {
  const validCategories = ['academic', 'arts', 'sports', 'technology', 'service', 'hobby']
  const sanitized = sanitizeText(category.trim().toLowerCase())

  if (!validCategories.includes(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid category' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate grade
 */
export function validateGrade(grade: string): { valid: boolean; sanitized: string; error?: string } {
  const validGrades = ['9', '10', '11', '12']
  const sanitized = sanitizeText(grade.trim())

  if (!validGrades.includes(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid grade' }
  }

  return { valid: true, sanitized }
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeLikeQuery(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

/**
 * Validate array of strings
 */
export function validateStringArray(
  arr: any,
  maxLength: number = 10,
  itemMaxLength: number = 100
): { valid: boolean; sanitized: string[]; error?: string } {
  if (!Array.isArray(arr)) {
    return { valid: false, sanitized: [], error: 'Must be an array' }
  }

  if (arr.length > maxLength) {
    return { valid: false, sanitized: [], error: `Array can contain maximum ${maxLength} items` }
  }

  const sanitized: string[] = []

  for (const item of arr) {
    if (typeof item !== 'string') {
      return { valid: false, sanitized: [], error: 'All items must be strings' }
    }

    const sanitizedItem = sanitizeText(item.trim())

    if (sanitizedItem.length > itemMaxLength) {
      return { valid: false, sanitized: [], error: `Each item must be less than ${itemMaxLength} characters` }
    }

    sanitized.push(sanitizedItem)
  }

  return { valid: true, sanitized }
}

/**
 * Rate limiting helper - tracks requests by IP or user ID
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

/**
 * Post-specific rate limiting with multiple time windows
 * Tracks posts per minute, hour, and day to prevent spam
 */
interface PostRateLimitRecord {
  minute: { count: number; resetTime: number }
  hour: { count: number; resetTime: number }
  day: { count: number; resetTime: number }
}

const postRateLimits = new Map<string, PostRateLimitRecord>()

export function checkPostRateLimit(
  identifier: string
): { 
  allowed: boolean
  remaining: { minute: number; hour: number; day: number }
  resetTime: number
  error?: string
} {
  const now = Date.now()
  const limits = {
    minute: { max: 5, window: 60000 },      // 5 posts per minute
    hour: { max: 20, window: 3600000 },     // 20 posts per hour
    day: { max: 50, window: 86400000 },     // 50 posts per day
  }

  let record = postRateLimits.get(identifier)

  // Initialize or reset expired windows
  if (!record) {
    record = {
      minute: { count: 0, resetTime: now + limits.minute.window },
      hour: { count: 0, resetTime: now + limits.hour.window },
      day: { count: 0, resetTime: now + limits.day.window },
    }
    postRateLimits.set(identifier, record)
  }

  // Reset expired windows
  if (now > record.minute.resetTime) {
    record.minute = { count: 0, resetTime: now + limits.minute.window }
  }
  if (now > record.hour.resetTime) {
    record.hour = { count: 0, resetTime: now + limits.hour.window }
  }
  if (now > record.day.resetTime) {
    record.day = { count: 0, resetTime: now + limits.day.window }
  }

  // Check all limits
  if (record.minute.count >= limits.minute.max) {
    return {
      allowed: false,
      remaining: {
        minute: 0,
        hour: limits.hour.max - record.hour.count,
        day: limits.day.max - record.day.count,
      },
      resetTime: record.minute.resetTime,
      error: `Too many posts. You can post ${limits.minute.max} times per minute. Please wait ${Math.ceil((record.minute.resetTime - now) / 1000)} seconds.`,
    }
  }

  if (record.hour.count >= limits.hour.max) {
    return {
      allowed: false,
      remaining: {
        minute: limits.minute.max - record.minute.count,
        hour: 0,
        day: limits.day.max - record.day.count,
      },
      resetTime: record.hour.resetTime,
      error: `Hourly post limit reached. You can post ${limits.hour.max} times per hour. Please wait ${Math.ceil((record.hour.resetTime - now) / 60000)} minutes.`,
    }
  }

  if (record.day.count >= limits.day.max) {
    return {
      allowed: false,
      remaining: {
        minute: limits.minute.max - record.minute.count,
        hour: limits.hour.max - record.hour.count,
        day: 0,
      },
      resetTime: record.day.resetTime,
      error: `Daily post limit reached. You can post ${limits.day.max} times per day. Please wait ${Math.ceil((record.day.resetTime - now) / 3600000)} hours.`,
    }
  }

  // Increment all counters
  record.minute.count++
  record.hour.count++
  record.day.count++

  return {
    allowed: true,
    remaining: {
      minute: limits.minute.max - record.minute.count,
      hour: limits.hour.max - record.hour.count,
      day: limits.day.max - record.day.count,
    },
    resetTime: record.minute.resetTime,
  }
}

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
  
  // Clean up post rate limits
  for (const [key, record] of postRateLimits.entries()) {
    if (now > record.day.resetTime) {
      postRateLimits.delete(key)
    }
  }
}, 300000) // Clean up every 5 minutes
