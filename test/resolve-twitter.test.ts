import { describe, it, expect } from 'vitest'
import { resolveTwitter } from '../src/resolve-twitter.ts'

const base = new URL('https://example.com')

describe('resolveTwitter', () => {
  it('returns null for null input', () => {
    expect(resolveTwitter(null, base)).toBeNull()
  })
  it('defaults card to summary when no images', () => {
    expect(resolveTwitter({ site: '@lucky' }, base)?.card).toBe('summary')
  })
  it('defaults card to summary_large_image when images present', () => {
    expect(resolveTwitter({ images: { url: '/img.png' } }, base)?.card).toBe('summary_large_image')
  })
  it('resolves relative image URL', () => {
    const result = resolveTwitter({ images: [{ url: '/img.png', alt: 'test' }] }, base)
    const images = Array.isArray(result?.images) ? result.images : [result?.images]
    expect(images[0]?.url).toBe('https://example.com/img.png')
  })
  it('preserves explicit card type', () => {
    expect(resolveTwitter({ card: 'player' }, base)?.card).toBe('player')
  })
})
