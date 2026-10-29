import { describe, it, expect } from 'vitest'
import { resolveAlternates } from '../src/resolve-alternates.ts'

const base = new URL('https://example.com')

describe('resolveAlternates', () => {
  it('returns null for null input', () => {
    expect(resolveAlternates(null, base)).toBeNull()
  })
  it('resolves relative canonical', () => {
    expect(resolveAlternates({ canonical: '/about' }, base)?.canonical).toBe(
      'https://example.com/about'
    )
  })
  it('keeps absolute canonical', () => {
    expect(resolveAlternates({ canonical: 'https://other.com' }, base)?.canonical).toBe(
      'https://other.com'
    )
  })
  it('resolves language alternate URLs', () => {
    const result = resolveAlternates(
      { canonical: '/', languages: { 'en-US': '/en', 'fr-FR': '/fr' } },
      base
    )
    expect(result?.languages?.['en-US']).toBe('https://example.com/en')
    expect(result?.languages?.['fr-FR']).toBe('https://example.com/fr')
  })
  it('resolves media alternate URLs', () => {
    const result = resolveAlternates(
      { media: { 'only screen and (max-width: 600px)': '/m' } },
      base
    )
    expect(result?.media?.['only screen and (max-width: 600px)']).toBe('https://example.com/m')
  })
  it('resolves type alternate URLs', () => {
    const result = resolveAlternates({ types: { 'application/rss+xml': '/rss.xml' } }, base)
    expect(result?.types?.['application/rss+xml']).toBe('https://example.com/rss.xml')
  })
  it('resolves alternate descriptors with a title', () => {
    const result = resolveAlternates(
      { types: { 'application/rss+xml': [{ url: '/rss.xml', title: 'Blog RSS' }] } },
      base
    )
    expect(result?.types?.['application/rss+xml']).toEqual([
      { url: 'https://example.com/rss.xml', title: 'Blog RSS' },
    ])
  })
  it('resolves a canonical descriptor', () => {
    expect(resolveAlternates({ canonical: { url: '/a', title: 'A' } }, base)?.canonical).toEqual({
      url: 'https://example.com/a',
      title: 'A',
    })
  })
})
