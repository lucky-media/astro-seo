import { describe, it, expect } from 'vitest'
import { resolveIcons } from '../src/resolve-icons.ts'

const base = new URL('https://example.com')

describe('resolveIcons', () => {
  it('returns null for null input', () => {
    expect(resolveIcons(null, base)).toBeNull()
  })
  it('normalizes string icon to Icon array', () => {
    const result = resolveIcons({ icon: '/favicon.ico' }, base)
    expect(Array.isArray(result?.icon)).toBe(true)
    expect((result!.icon as any[])[0].url).toBe('https://example.com/favicon.ico')
  })
  it('resolves relative icon URL', () => {
    const result = resolveIcons({ icon: [{ url: '/icon-192.png', sizes: '192x192' }] }, base)
    expect((result!.icon as any[])[0].url).toBe('https://example.com/icon-192.png')
  })
  it('resolves apple-touch-icon URL', () => {
    const result = resolveIcons({ apple: '/apple-touch-icon.png' }, base)
    expect((result!.apple as any[])[0].url).toBe('https://example.com/apple-touch-icon.png')
  })
})
