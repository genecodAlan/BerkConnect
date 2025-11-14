/**
 * Safe HTML Component
 * Renders user-generated content safely to prevent XSS attacks
 */

"use client"

import { useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: string[]
}

/**
 * Component that safely renders HTML content
 * Automatically sanitizes input to prevent XSS attacks
 */
export function SafeHtml({ 
  html, 
  className = '',
  allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes = ['href', 'target', 'rel']
}: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: true,
      // Force links to open in new tab with security attributes
      HOOKS: {
        afterSanitizeAttributes: (node) => {
          if (node.tagName === 'A') {
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener noreferrer')
          }
        }
      }
    })
  }, [html, allowedTags, allowedAttributes])

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

/**
 * Component for rendering plain text only (strips all HTML)
 */
export function SafeText({ text, className = '' }: { text: string; className?: string }) {
  const sanitizedText = useMemo(() => {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
  }, [text])

  return <span className={className}>{sanitizedText}</span>
}

/**
 * Hook for sanitizing text in React components
 */
export function useSanitizedText(text: string): string {
  return useMemo(() => {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
  }, [text])
}

/**
 * Hook for sanitizing HTML in React components
 */
export function useSanitizedHtml(
  html: string,
  allowedTags: string[] = ['b', 'i', 'em', 'strong', 'a', 'p', 'br']
): string {
  return useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    })
  }, [html, allowedTags])
}
