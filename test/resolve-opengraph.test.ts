import { describe, it, expect } from 'vitest'
import { resolveOpenGraph } from '../src/resolve-opengraph.ts'

const base = new URL('https://example.com')

describe('resolveOpenGraph', () => {
  it('returns null for null input', () => {
    expect(resolveOpenGraph(null, base)).toBeNull()
  })
  it('resolves relative image URL', () => {
    const result = resolveOpenGraph({ images: [{ url: '/og.png', alt: 'Home' }] }, base)
    expect(result?.images[0].url).toBe('https://example.com/og.png')
  })
  it('keeps absolute image URL unchanged', () => {
    const result = resolveOpenGraph({ images: [{ url: 'https://cdn.example.com/img.png' }] }, base)
    expect(result?.images[0].url).toBe('https://cdn.example.com/img.png')
  })
  it('normalizes single image object to array', () => {
    const result = resolveOpenGraph({ images: { url: '/img.png' } }, base)
    expect(Array.isArray(result?.images)).toBe(true)
    expect(result?.images).toHaveLength(1)
  })
  it('accepts a string image', () => {
    expect(resolveOpenGraph({ images: '/og.png' }, base)?.images).toEqual([
      { url: 'https://example.com/og.png' },
    ])
  })
  it('accepts a URL image', () => {
    expect(resolveOpenGraph({ images: new URL('https://cdn.com/a.png') }, base)?.images).toEqual([
      { url: 'https://cdn.com/a.png' },
    ])
  })
  it('accepts a mixed image array', () => {
    const result = resolveOpenGraph({ images: ['/a.png', { url: '/b.png', alt: 'B' }] }, base)
    expect(result?.images).toEqual([
      { url: 'https://example.com/a.png' },
      { url: 'https://example.com/b.png', alt: 'B' },
    ])
  })
  it('drops images without a url', () => {
    const result = resolveOpenGraph({ images: [{ url: '' }, '/ok.png'] }, base)
    expect(result?.images).toEqual([{ url: 'https://example.com/ok.png' }])
  })
  it('resolves a template title to a string', () => {
    expect(
      resolveOpenGraph({ title: { default: 'Home', template: '%s | Site' } }, base)?.title
    ).toBe('Home')
  })
  it('resolves an absolute title to a string', () => {
    expect(resolveOpenGraph({ title: { absolute: 'Exact' } }, base)?.title).toBe('Exact')
  })
  it('defaults type to website', () => {
    expect(resolveOpenGraph({}, base)?.type).toBe('website')
  })
  it('resolves og.url', () => {
    expect(resolveOpenGraph({ url: '/about' }, base)?.url).toBe('https://example.com/about')
  })
})
