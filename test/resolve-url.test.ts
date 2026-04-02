import { describe, it, expect } from 'vitest'
import { resolveUrl } from '../src/resolve-url.ts'

describe('resolveUrl', () => {
  it('returns absolute URL string unchanged', () => {
    expect(resolveUrl('https://example.com/page', null)).toBe('https://example.com/page')
  })
  it('resolves relative path using metadataBase', () => {
    expect(resolveUrl('/about', new URL('https://example.com'))).toBe('https://example.com/about')
  })
  it('resolves URL instance to string', () => {
    expect(resolveUrl(new URL('https://cdn.example.com/img.png'), null)).toBe(
      'https://cdn.example.com/img.png'
    )
  })
  it('returns null for null input', () => {
    expect(resolveUrl(null, null)).toBeNull()
  })
  it('returns relative path as-is when no metadataBase', () => {
    expect(resolveUrl('/page', null)).toBe('/page')
  })
})
