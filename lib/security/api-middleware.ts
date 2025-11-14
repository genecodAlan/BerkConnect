/**
 * API Security Middleware
 * Provides rate limiting, input validation, and security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './input-validator'

/**
 * Get client identifier for rate limiting (IP address or user ID)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  return 'unknown'
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(identifier, maxRequests, windowMs)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const response = await handler(request, ...args)

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())

    return response
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://vercel.live https://*.vercel.app; " +
    "frame-ancestors 'none';"
  )
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

/**
 * Validate request body size
 */
export async function validateRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 1048576 // 1MB default
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return {
      valid: false,
      error: `Request body too large. Maximum size is ${maxSizeBytes} bytes.`,
    }
  }

  return { valid: true }
}

/**
 * Validate Content-Type header
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[] = ['application/json']
): { valid: boolean; error?: string } {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return { valid: false, error: 'Content-Type header is required' }
  }

  const isAllowed = allowedTypes.some(type => contentType.includes(type))
  
  if (!isAllowed) {
    return {
      valid: false,
      error: `Invalid Content-Type. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Error response helper with security headers
 */
export function secureErrorResponse(
  error: string,
  status: number = 400
): NextResponse {
  const response = NextResponse.json(
    { success: false, error },
    { status }
  )
  
  return addSecurityHeaders(response)
}

/**
 * Success response helper with security headers
 */
export function secureSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(
    { success: true, ...data },
    { status }
  )
  
  return addSecurityHeaders(response)
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: any): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, don't expose detailed error messages
    return 'An error occurred. Please try again later.'
  }
  
  // In development, show more details
  if (error instanceof Error) {
    return error.message
  }
  
  return String(error)
}
