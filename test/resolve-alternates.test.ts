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
})
