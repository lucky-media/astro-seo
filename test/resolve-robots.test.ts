import { describe, it, expect } from 'vitest'
import { resolveRobots } from '../src/resolve-robots.ts'

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
})
