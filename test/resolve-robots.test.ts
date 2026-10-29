import { describe, it, expect } from 'vitest'
import { resolveRobots, resolveGoogleBot } from '../src/resolve-robots.ts'

describe('resolveRobots', () => {
  it('returns null for null input', () => {
    expect(resolveRobots(null)).toBeNull()
  })
  it('passes through string unchanged', () => {
    expect(resolveRobots('noindex, nofollow')).toBe('noindex, nofollow')
  })
  it('converts { index: true, follow: true }', () => {
    expect(resolveRobots({ index: true, follow: true })).toBe('index, follow')
  })
  it('converts { index: false, follow: false }', () => {
    expect(resolveRobots({ index: false, follow: false })).toBe('noindex, nofollow')
  })
  it('handles nocache flag', () => {
    expect(resolveRobots({ index: true, follow: false, nocache: true })).toBe(
      'index, nofollow, nocache'
    )
  })
  it('converts the extended robots directives', () => {
    expect(
      resolveRobots({
        index: true,
        noarchive: true,
        nosnippet: false,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        unavailable_after: '2026-12-31',
      })
    ).toBe(
      'index, noarchive, unavailable_after:2026-12-31, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
    )
  })
})

describe('resolveGoogleBot', () => {
  it('returns null when robots is a string', () => {
    expect(resolveGoogleBot('noindex')).toBeNull()
  })
  it('returns null when googleBot is not set', () => {
    expect(resolveGoogleBot({ index: true })).toBeNull()
  })
  it('passes a googleBot string through', () => {
    expect(resolveGoogleBot({ googleBot: 'nosnippet' })).toBe('nosnippet')
  })
  it('converts a googleBot directive object', () => {
    expect(resolveGoogleBot({ googleBot: { index: true, 'max-snippet': 50 } })).toBe(
      'index, max-snippet:50'
    )
  })
})
