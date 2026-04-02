import { describe, it, expect } from 'vitest'
import { mergeMetadata } from '../src/merge.ts'
import { createDefaultMetadata } from '../src/defaults.ts'
import type { Metadata, ResolvedMetadata } from '../src/types.ts'

describe('mergeMetadata', () => {
  it('applies child title', () => {
    const result = mergeMetadata(createDefaultMetadata(), {
      title: 'Child Page',
    })
    expect(result.title).toBe('Child Page')
  })

  it('applies parent template to child string title', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      titleTemplate: '%s | My App',
    }
    expect(mergeMetadata(parent, { title: 'Settings' }).title).toBe('Settings | My App')
  })

  it('absolute title overrides parent template', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      titleTemplate: '%s | My App',
    }
    expect(mergeMetadata(parent, { title: { absolute: 'Custom' } }).title).toBe('Custom')
  })

  it('child inherits parent description when not set', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      description: 'Parent desc',
    }
    expect(mergeMetadata(parent, { title: 'Child' }).description).toBe('Parent desc')
  })

  it('child overrides parent description', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      description: 'Parent desc',
    }
    expect(mergeMetadata(parent, { description: 'Child desc' }).description).toBe('Child desc')
  })

  it('resolves OG image URLs with metadataBase', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      openGraph: { images: [{ url: '/og.png' }] },
    }
    const result = mergeMetadata(createDefaultMetadata(), child)
    expect(result.openGraph?.images[0].url).toBe('https://example.com/og.png')
  })

  it('stores titleTemplate from TemplateString for children to inherit', () => {
    const result = mergeMetadata(createDefaultMetadata(), {
      title: { default: 'Home', template: '%s | Site' },
    })
    expect(result.titleTemplate).toBe('%s | Site')
    expect(result.title).toBe('Home')
  })

  it('auto-detects twitter card from images', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      twitter: { site: '@lucky', images: [{ url: '/tw.png' }] },
    }
    expect(mergeMetadata(createDefaultMetadata(), child).twitter?.card).toBe('summary_large_image')
  })

  it('merges verification objects from parent and child', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      verification: { google: 'abc' },
    }
    const result = mergeMetadata(parent, { verification: { yandex: 'xyz' } })
    expect(result.verification.google).toBe('abc')
    expect(result.verification.yandex).toBe('xyz')
  })

  it('child OG with title only inherits parent OG image', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      openGraph: {
        type: 'website',
        images: [{ url: 'https://example.com/default-og.png' }],
      },
    }
    const result = mergeMetadata(parent, { openGraph: { title: 'My Page' } })
    expect(result.openGraph?.images[0].url).toBe('https://example.com/default-og.png')
  })

  it('child OG with explicit images overrides parent OG images', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      openGraph: {
        type: 'website',
        images: [{ url: 'https://example.com/default-og.png' }],
      },
    }
    const result = mergeMetadata(parent, {
      openGraph: { images: [{ url: 'https://example.com/page-og.png' }] },
    })
    expect(result.openGraph?.images[0].url).toBe('https://example.com/page-og.png')
    expect(result.openGraph?.images).toHaveLength(1)
  })

  it('child openGraph: null clears OG entirely', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      openGraph: {
        type: 'website',
        images: [{ url: 'https://example.com/default-og.png' }],
      },
    }
    const result = mergeMetadata(parent, { openGraph: null })
    expect(result.openGraph).toBeNull()
  })

  it('child OG with no type inherits parent OG type', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      openGraph: { type: 'article', images: [] },
    }
    const result = mergeMetadata(parent, { openGraph: { title: 'Post' } })
    expect(result.openGraph?.type).toBe('article')
  })

  it('child Twitter with title only inherits parent Twitter image', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      twitter: {
        card: 'summary_large_image',
        images: [{ url: 'https://example.com/default-tw.png' }],
      },
    }
    const result = mergeMetadata(parent, { twitter: { title: 'My Page' } })
    expect(result.twitter?.images?.[0]?.url).toBe('https://example.com/default-tw.png')
  })

  it('child Twitter with explicit images overrides parent Twitter images', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      twitter: {
        card: 'summary_large_image',
        images: [{ url: 'https://example.com/default-tw.png' }],
      },
    }
    const result = mergeMetadata(parent, {
      twitter: { images: [{ url: 'https://example.com/page-tw.png' }] },
    })
    expect(result.twitter?.images?.[0]?.url).toBe('https://example.com/page-tw.png')
  })

  it('child twitter: null clears Twitter entirely', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      twitter: { card: 'summary', images: [{ url: 'https://example.com/tw.png' }] },
    }
    const result = mergeMetadata(parent, { twitter: null })
    expect(result.twitter).toBeNull()
  })

  it('child Twitter with no card inherits parent Twitter card', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      twitter: { card: 'player', images: [] },
    }
    const result = mergeMetadata(parent, { twitter: { title: 'Post' } })
    expect(result.twitter?.card).toBe('player')
  })

  it('child OG with images: [] clears parent OG images', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      openGraph: {
        type: 'website',
        images: [{ url: 'https://example.com/default-og.png' }],
      },
    }
    const result = mergeMetadata(parent, { openGraph: { images: [] } })
    expect(result.openGraph?.images).toHaveLength(0)
  })

  it('child Twitter with images: [] clears parent Twitter images', () => {
    const parent: ResolvedMetadata = {
      ...createDefaultMetadata(),
      twitter: {
        card: 'summary_large_image',
        images: [{ url: 'https://example.com/default-tw.png' }],
      },
    }
    const result = mergeMetadata(parent, { twitter: { images: [] } })
    expect(result.twitter?.images).toBeUndefined()
  })
})
