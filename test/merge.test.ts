import { describe, it, expect } from 'vitest'
import { mergeMetadata, postProcessMetadata } from '../src/merge.ts'
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

  it('falls back to OG images for twitter when no twitter images are set', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      openGraph: { images: [{ url: '/og.png', alt: 'Page OG' }] },
      twitter: { site: '@lucky' },
    }
    const result = postProcessMetadata(mergeMetadata(createDefaultMetadata(), child))
    expect(result.twitter?.images?.[0]?.url).toBe('https://example.com/og.png')
    expect(result.twitter?.images?.[0]?.alt).toBe('Page OG')
  })

  it('sets twitter card to summary_large_image when falling back to OG images', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      openGraph: { images: [{ url: '/og.png' }] },
      twitter: { site: '@lucky' },
    }
    const result = postProcessMetadata(mergeMetadata(createDefaultMetadata(), child))
    expect(result.twitter?.card).toBe('summary_large_image')
  })

  it('does not override explicit twitter images with OG images', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      openGraph: { images: [{ url: '/og.png' }] },
      twitter: { images: [{ url: '/tw.png' }] },
    }
    const result = postProcessMetadata(mergeMetadata(createDefaultMetadata(), child))
    expect(result.twitter?.images?.[0]?.url).toBe('https://example.com/tw.png')
  })

  it('does not fall back to OG images when twitter is not set', () => {
    const child: Metadata = {
      metadataBase: new URL('https://example.com'),
      openGraph: { images: [{ url: '/og.png' }] },
    }
    const result = mergeMetadata(createDefaultMetadata(), child)
    expect(result.twitter).toBeNull()
  })

  it('twitter images match page OG image when siteConfig has global OG and twitter handle but page has its own OG', () => {
    // Bug: fallback fires during siteConfig merge and locks in the global OG image as
    // twitter.images, so a later page-level OG image never replaces it.
    const siteConfig: Metadata = {
      openGraph: { images: [{ url: 'https://example.com/global.png' }] },
      twitter: { site: '@lucky' },
    }
    const pageMetadata: Metadata = {
      openGraph: { images: [{ url: 'https://example.com/page.png' }] },
    }

    const base = mergeMetadata(createDefaultMetadata(), siteConfig)
    const resolved = postProcessMetadata(mergeMetadata(base, pageMetadata))

    expect(resolved.twitter?.images?.[0]?.url).toBe('https://example.com/page.png')
  })
})

describe('mergeMetadata openGraph and twitter titles', () => {
  it('applies the parent OG title template to a child OG title', () => {
    const site = mergeMetadata(createDefaultMetadata(), {
      openGraph: { title: { default: 'Home', template: '%s | OG Site' } },
    })
    const page = mergeMetadata(site, { openGraph: { title: 'About' } })
    expect(page.openGraph?.title).toBe('About | OG Site')
  })

  it('keeps the parent OG title unchanged when the child does not set one', () => {
    const site = mergeMetadata(createDefaultMetadata(), {
      openGraph: { title: { default: 'Home', template: '%s | OG Site' } },
    })
    const page = mergeMetadata(site, { openGraph: { description: 'x' } })
    expect(page.openGraph?.title).toBe('Home')
  })

  it('does not apply the document title template to the OG title', () => {
    const site = mergeMetadata(createDefaultMetadata(), {
      title: { default: 'Home', template: '%s | Doc' },
    })
    const page = mergeMetadata(site, { openGraph: { title: 'About' } })
    expect(page.openGraph?.title).toBe('About')
  })

  it('applies the parent twitter title template to a child twitter title', () => {
    const site = mergeMetadata(createDefaultMetadata(), {
      twitter: { title: { default: 'Home', template: '%s | TW' } },
    })
    const page = mergeMetadata(site, { twitter: { title: 'About' } })
    expect(page.twitter?.title).toBe('About | TW')
  })

  it('keeps alternates.types from the child', () => {
    const page = mergeMetadata(createDefaultMetadata(), {
      metadataBase: new URL('https://example.com'),
      alternates: { types: { 'application/rss+xml': '/rss.xml' } },
    })
    expect(page.alternates?.types?.['application/rss+xml']).toBe('https://example.com/rss.xml')
  })
})

describe('postProcessMetadata', () => {
  const resolve = (metadata: Metadata) =>
    postProcessMetadata(mergeMetadata(createDefaultMetadata(), metadata))

  it('fills twitter title, description and images from OG', () => {
    const result = resolve({
      openGraph: { title: 'title', description: 'description', images: 'https://test.com' },
      twitter: { card: 'summary_large_image' },
    })
    expect(result.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'title',
      description: 'description',
      images: [{ url: 'https://test.com' }],
    })
  })

  it('prefers the OG title and description over the document ones for twitter', () => {
    const result = resolve({
      title: 'doc title',
      description: 'doc description',
      openGraph: { title: 'og-title', description: 'og-description' },
    })
    expect(result.twitter?.title).toBe('og-title')
    expect(result.twitter?.description).toBe('og-description')
  })

  it('creates twitter from OG when twitter is not set', () => {
    const result = resolve({ openGraph: { title: 'OG', images: 'https://test.com/og.png' } })
    expect(result.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'OG',
      images: [{ url: 'https://test.com/og.png' }],
    })
  })

  it('creates a summary twitter card when OG has no images', () => {
    expect(resolve({ openGraph: { title: 'OG' } }).twitter?.card).toBe('summary')
  })

  it('copies all OG image fields to twitter', () => {
    const result = resolve({
      openGraph: { images: { url: 'https://t.com/a.png', alt: 'A', width: 1200, height: 630 } },
    })
    expect(result.twitter?.images).toEqual([
      { url: 'https://t.com/a.png', alt: 'A', width: 1200, height: 630 },
    ])
  })

  it('inherits the document title and description into OG', () => {
    const result = resolve({
      title: 'My title',
      description: 'My description',
      openGraph: { images: 'https://test.com/og.png' },
    })
    expect(result.openGraph?.title).toBe('My title')
    expect(result.openGraph?.description).toBe('My description')
    expect(result.twitter?.title).toBe('My title')
    expect(result.twitter?.description).toBe('My description')
  })

  it('inherits the templated document title into OG', () => {
    const site = mergeMetadata(createDefaultMetadata(), {
      title: { default: 'Home', template: '%s | Site' },
      openGraph: { siteName: 'Site' },
    })
    const result = postProcessMetadata(mergeMetadata(site, { title: 'About' }))
    expect(result.openGraph?.title).toBe('About | Site')
  })

  it('inherits the document title into twitter when OG is not set', () => {
    const result = resolve({
      title: 'My title',
      description: 'My description',
      twitter: { images: 'https://test.com/twitter.png' },
    })
    expect(result.openGraph).toBeNull()
    expect(result.twitter?.title).toBe('My title')
    expect(result.twitter?.description).toBe('My description')
  })

  it('does not override an explicit twitter title', () => {
    const result = resolve({
      title: 'My title',
      twitter: { title: 'My twitter title' },
    })
    expect(result.twitter?.title).toBe('My twitter title')
  })

  it('leaves OG and twitter null when neither is set', () => {
    const result = resolve({ title: 'Only title' })
    expect(result.openGraph).toBeNull()
    expect(result.twitter).toBeNull()
  })

  it('does not feed inherited values back into a later merge', () => {
    const site = postProcessMetadata(
      mergeMetadata(createDefaultMetadata(), { title: 'Site', openGraph: { siteName: 'S' } })
    )
    expect(site.openGraph?.title).toBe('Site')
    const base = mergeMetadata(createDefaultMetadata(), {
      title: 'Site',
      openGraph: { siteName: 'S' },
    })
    const page = postProcessMetadata(mergeMetadata(base, { title: 'Page' }))
    expect(page.openGraph?.title).toBe('Page')
  })
})

describe('mergeMetadata extra fields', () => {
  const resolve = (metadata: Metadata) =>
    mergeMetadata(createDefaultMetadata(), {
      metadataBase: new URL('https://example.com'),
      ...metadata,
    })

  it('resolves googleBot from robots', () => {
    expect(resolve({ robots: { index: true, googleBot: { index: false } } }).googleBot).toBe(
      'noindex'
    )
  })

  it('clears googleBot when a child sets robots without it', () => {
    const parent = resolve({ robots: { googleBot: 'noindex' } })
    expect(mergeMetadata(parent, { robots: 'index' }).googleBot).toBeNull()
  })

  it('normalizes a single author to an array and resolves its url', () => {
    expect(resolve({ authors: { name: 'Ana', url: '/ana' } }).authors).toEqual([
      { name: 'Ana', url: 'https://example.com/ana' },
    ])
  })

  it('resolves pagination URLs', () => {
    expect(resolve({ pagination: { previous: '/blog/1', next: '/blog/3' } }).pagination).toEqual({
      previous: 'https://example.com/blog/1',
      next: 'https://example.com/blog/3',
    })
  })

  it('normalizes archives, assets and bookmarks to resolved arrays', () => {
    const result = resolve({ archives: '/archive', assets: ['/a', '/b'], bookmarks: '/bm' })
    expect(result.archives).toEqual(['https://example.com/archive'])
    expect(result.assets).toEqual(['https://example.com/a', 'https://example.com/b'])
    expect(result.bookmarks).toEqual(['https://example.com/bm'])
  })

  it('keeps abstract', () => {
    expect(resolve({ abstract: 'Short' }).abstract).toBe('Short')
  })

  it('builds the viewport string from an object', () => {
    expect(
      resolve({
        viewport: {
          width: 'device-width',
          initialScale: 1,
          maximumScale: 5,
          userScalable: false,
          viewportFit: 'cover',
        },
      }).viewport
    ).toBe(
      'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'
    )
  })

  it('passes a viewport string through', () => {
    expect(resolve({ viewport: 'width=device-width' }).viewport).toBe('width=device-width')
  })

  it('normalizes themeColor', () => {
    expect(resolve({ themeColor: '#fff' }).themeColor).toEqual([{ color: '#fff' }])
    expect(
      resolve({ themeColor: [{ color: '#000', media: '(prefers-color-scheme: dark)' }] }).themeColor
    ).toEqual([{ color: '#000', media: '(prefers-color-scheme: dark)' }])
  })

  it('keeps colorScheme', () => {
    expect(resolve({ colorScheme: 'light dark' }).colorScheme).toBe('light dark')
  })

  it('resolves appleWebApp: true', () => {
    expect(resolve({ appleWebApp: true }).appleWebApp).toEqual({
      capable: true,
      title: null,
      startupImage: null,
      statusBarStyle: 'default',
    })
  })

  it('resolves an appleWebApp object', () => {
    expect(
      resolve({
        appleWebApp: {
          title: 'App',
          statusBarStyle: 'black-translucent',
          startupImage: ['/s.png', { url: '/m.png', media: '(device-width: 768px)' }],
        },
      }).appleWebApp
    ).toEqual({
      capable: true,
      title: 'App',
      statusBarStyle: 'black-translucent',
      startupImage: [
        { url: 'https://example.com/s.png' },
        { url: 'https://example.com/m.png', media: '(device-width: 768px)' },
      ],
    })
  })

  it('keeps formatDetection', () => {
    expect(resolve({ formatDetection: { telephone: false } }).formatDetection).toEqual({
      telephone: false,
    })
  })

  it('resolves the itunes appArgument', () => {
    expect(resolve({ itunes: { appId: '123', appArgument: '/open' } }).itunes).toEqual({
      appId: '123',
      appArgument: 'https://example.com/open',
    })
  })

  it('normalizes appLinks to arrays', () => {
    expect(
      resolve({
        appLinks: { ios: { url: 'app://x', app_store_id: 1 }, web: [{ url: '/web' }] },
      }).appLinks
    ).toEqual({
      ios: [{ url: 'app://x', app_store_id: 1 }],
      web: [{ url: 'https://example.com/web' }],
    })
  })

  it('normalizes facebook admins', () => {
    expect(resolve({ facebook: { admins: 'a1' } }).facebook).toEqual({ admins: ['a1'] })
  })

  it('keeps pinterest', () => {
    expect(resolve({ pinterest: { richPin: false } }).pinterest).toEqual({ richPin: false })
  })

  it('inherits each extra field from the parent when the child omits it', () => {
    const parent = resolve({ abstract: 'A', colorScheme: 'dark', pagination: { next: '/n' } })
    const child = mergeMetadata(parent, { title: 'Child' })
    expect(child.abstract).toBe('A')
    expect(child.colorScheme).toBe('dark')
    expect(child.pagination?.next).toBe('https://example.com/n')
  })

  it('clears an extra field when the child sets it to null', () => {
    const parent = resolve({ abstract: 'A', themeColor: '#fff', appleWebApp: true })
    const child = mergeMetadata(parent, { abstract: null, themeColor: null, appleWebApp: null })
    expect(child.abstract).toBeNull()
    expect(child.themeColor).toBeNull()
    expect(child.appleWebApp).toBeNull()
  })
})

describe('twitter card inference across layers', () => {
  it('infers summary_large_image when a child adds images to an inferred parent card', () => {
    const site = mergeMetadata(createDefaultMetadata(), { twitter: { site: '@lucky' } })
    const page = mergeMetadata(site, { twitter: { images: 'https://example.com/tw.png' } })
    expect(page.twitter?.card).toBe('summary_large_image')
  })

  it('keeps an explicit parent card when a child adds images', () => {
    const site = mergeMetadata(createDefaultMetadata(), { twitter: { card: 'summary' } })
    const page = mergeMetadata(site, { twitter: { images: 'https://example.com/tw.png' } })
    expect(page.twitter?.card).toBe('summary')
  })

  it('keeps an explicit card when post-processing copies OG images', () => {
    const resolved = postProcessMetadata(
      mergeMetadata(createDefaultMetadata(), {
        openGraph: { images: 'https://example.com/og.png' },
        twitter: { card: 'summary' },
      })
    )
    expect(resolved.twitter?.card).toBe('summary')
  })
})
