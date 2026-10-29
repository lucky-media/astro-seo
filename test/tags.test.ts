import { describe, it, expect } from 'vitest'
import { createTags, type Tag } from '../src/tags.ts'
import { mergeMetadata, postProcessMetadata } from '../src/merge.ts'
import { createDefaultMetadata } from '../src/defaults.ts'
import type { Metadata } from '../src/types.ts'

function toHtml(tags: Tag[]): string[] {
  return tags.map((t) => {
    if (t.tag === 'title') return `<title>${t.content}</title>`
    const attrs = Object.entries(t.attrs)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    return `<${t.tag} ${attrs}>`
  })
}

const base = new URL('https://example.com')

function render(metadata: Metadata, currentUrl?: string): string[] {
  const resolved = postProcessMetadata(
    mergeMetadata(createDefaultMetadata(), { metadataBase: base, ...metadata })
  )
  return toHtml(createTags(resolved, currentUrl))
}

describe('createTags basics', () => {
  it('renders title, description and standard names', () => {
    const html = render({
      title: 'Home',
      description: 'Desc',
      applicationName: 'App',
      generator: 'Astro',
      referrer: 'origin',
      publisher: 'Pub',
      category: 'tech',
      keywords: ['a', 'b'],
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<title>Home</title>',
        '<meta name="description" content="Desc">',
        '<meta name="application-name" content="App">',
        '<meta name="generator" content="Astro">',
        '<meta name="referrer" content="origin">',
        '<meta name="publisher" content="Pub">',
        '<meta name="category" content="tech">',
        '<meta name="keywords" content="a, b">',
      ])
    )
  })

  it('renders nothing for empty metadata without a current URL', () => {
    expect(toHtml(createTags(createDefaultMetadata()))).toEqual([])
  })

  it('falls back to the current URL for canonical and og:url', () => {
    const html = render({}, 'https://example.com/page')
    expect(html).toContain('<link rel="canonical" href="https://example.com/page">')
    expect(html).toContain('<meta property="og:url" content="https://example.com/page">')
  })

  it('renders robots and hreflang links', () => {
    const html = render({
      robots: { index: false, follow: true },
      alternates: { canonical: '/a', languages: { fr: '/fr' } },
    })
    expect(html).toContain('<meta name="robots" content="noindex, follow">')
    expect(html).toContain('<link rel="canonical" href="https://example.com/a">')
    expect(html).toContain('<link rel="alternate" hreflang="fr" href="https://example.com/fr">')
  })

  it('renders icons and the manifest', () => {
    const html = render({
      icons: {
        icon: { url: '/i.png', type: 'image/png', sizes: '32x32' },
        apple: '/apple.png',
        shortcut: '/s.ico',
      },
      manifest: '/site.webmanifest',
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<link rel="icon" href="https://example.com/i.png" type="image/png" sizes="32x32">',
        '<link rel="apple-touch-icon" href="https://example.com/apple.png">',
        '<link rel="shortcut icon" href="https://example.com/s.ico">',
        '<link rel="manifest" href="https://example.com/site.webmanifest">',
      ])
    )
  })

  it('renders OG and twitter tags', () => {
    const html = render({
      openGraph: {
        title: 'OG',
        siteName: 'Site',
        locale: 'en_US',
        images: { url: '/og.png', alt: 'Alt', width: 1200, height: 630, type: 'image/png' },
      },
      twitter: { site: '@s', creator: '@c' },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="og:title" content="OG">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Site">',
        '<meta property="og:locale" content="en_US">',
        '<meta property="og:image" content="https://example.com/og.png">',
        '<meta property="og:image:alt" content="Alt">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:type" content="image/png">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@s">',
        '<meta name="twitter:creator" content="@c">',
        '<meta name="twitter:title" content="OG">',
        '<meta name="twitter:image" content="https://example.com/og.png">',
      ])
    )
  })

  it('renders google and yandex verification and other tags', () => {
    const html = render({
      verification: { google: ['g1', 'g2'], yandex: 'y' },
      other: { custom: ['a', 'b'], single: 'c' },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="google-site-verification" content="g1">',
        '<meta name="google-site-verification" content="g2">',
        '<meta name="yandex-verification" content="y">',
        '<meta name="custom" content="a">',
        '<meta name="custom" content="b">',
        '<meta name="single" content="c">',
      ])
    )
  })
})

describe('createTags render fixes', () => {
  it('renders googlebot', () => {
    expect(render({ robots: { index: true, googleBot: { index: false } } })).toContain(
      '<meta name="googlebot" content="noindex">'
    )
  })

  it('renders a single author with a url', () => {
    const html = render({ authors: { name: 'Ana', url: '/ana' } })
    expect(html).toContain('<link rel="author" href="https://example.com/ana">')
    expect(html).toContain('<meta name="author" content="Ana">')
  })

  it('renders creator as name="creator"', () => {
    const html = render({ creator: 'Studio' })
    expect(html).toContain('<meta name="creator" content="Studio">')
    expect(html).not.toContain('<meta name="author" content="Studio">')
  })

  it('renders og:image:secure_url and og:locale:alternate', () => {
    const html = render({
      openGraph: {
        alternateLocale: ['fr_FR', 'de_DE'],
        images: { url: '/og.png', secureUrl: 'https://example.com/s.png' },
      },
    })
    expect(html).toContain(
      '<meta property="og:image:secure_url" content="https://example.com/s.png">'
    )
    expect(html).toContain('<meta property="og:locale:alternate" content="fr_FR">')
    expect(html).toContain('<meta property="og:locale:alternate" content="de_DE">')
  })

  it('renders twitter site and creator ids', () => {
    const html = render({ twitter: { siteId: '111', creatorId: '222' } })
    expect(html).toContain('<meta name="twitter:site:id" content="111">')
    expect(html).toContain('<meta name="twitter:creator:id" content="222">')
  })

  it('renders all twitter image fields', () => {
    const html = render({
      twitter: { images: { url: '/t.png', alt: 'T', width: 800, height: 400, type: 'image/png' } },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="twitter:image:width" content="800">',
        '<meta name="twitter:image:height" content="400">',
        '<meta name="twitter:image:type" content="image/png">',
      ])
    )
  })

  it('renders yahoo, me and other verification', () => {
    const html = render({ verification: { yahoo: 'yh', me: ['m1', 'm2'], other: { bing: 'b' } } })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="y_key" content="yh">',
        '<meta name="me" content="m1">',
        '<meta name="me" content="m2">',
        '<meta name="bing" content="b">',
      ])
    )
  })

  it('renders icons.other and the extra icon attributes', () => {
    const html = render({
      icons: {
        icon: { url: '/d.png', media: '(prefers-color-scheme: dark)', fetchPriority: 'high' },
        apple: { url: '/a.png', type: 'image/png' },
        other: { rel: 'mask-icon', url: '/m.svg', color: '#000' },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<link rel="icon" href="https://example.com/d.png" media="(prefers-color-scheme: dark)" fetchpriority="high">',
        '<link rel="apple-touch-icon" href="https://example.com/a.png" type="image/png">',
        '<link rel="mask-icon" href="https://example.com/m.svg" color="#000">',
      ])
    )
  })

  it('renders alternates media, types and descriptor titles', () => {
    const html = render({
      alternates: {
        canonical: { url: '/c', title: 'C' },
        languages: { fr: [{ url: '/fr', title: 'Français' }] },
        media: { 'only screen and (max-width: 600px)': '/m' },
        types: { 'application/rss+xml': [{ url: '/rss.xml', title: 'RSS' }] },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<link rel="canonical" href="https://example.com/c" title="C">',
        '<link rel="alternate" hreflang="fr" href="https://example.com/fr" title="Français">',
        '<link rel="alternate" media="only screen and (max-width: 600px)" href="https://example.com/m">',
        '<link rel="alternate" type="application/rss+xml" href="https://example.com/rss.xml" title="RSS">',
      ])
    )
  })

  it('skips empty values in other', () => {
    const html = render({ other: { empty: '', num: 3 } })
    expect(html).toContain('<meta name="num" content="3">')
    expect(html.some((t) => t.includes('name="empty"'))).toBe(false)
  })
})

describe('createTags extra fields', () => {
  it('renders abstract, archives, assets, bookmarks and pagination', () => {
    const html = render({
      abstract: 'Short',
      archives: '/archive',
      assets: '/assets',
      bookmarks: '/bm',
      pagination: { previous: '/p/1', next: '/p/3' },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="abstract" content="Short">',
        '<link rel="archives" href="https://example.com/archive">',
        '<link rel="assets" href="https://example.com/assets">',
        '<link rel="bookmarks" href="https://example.com/bm">',
        '<link rel="prev" href="https://example.com/p/1">',
        '<link rel="next" href="https://example.com/p/3">',
      ])
    )
  })

  it('renders viewport, theme-color and color-scheme', () => {
    const html = render({
      viewport: { width: 'device-width', initialScale: 1 },
      themeColor: [{ color: '#fff', media: '(prefers-color-scheme: light)' }, { color: '#000' }],
      colorScheme: 'light dark',
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)">',
        '<meta name="theme-color" content="#000">',
        '<meta name="color-scheme" content="light dark">',
      ])
    )
  })

  it('renders appleWebApp', () => {
    const html = render({
      appleWebApp: {
        title: 'App',
        statusBarStyle: 'black',
        startupImage: [{ url: '/s.png', media: '(device-width: 768px)' }],
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="App">',
        '<link rel="apple-touch-startup-image" href="https://example.com/s.png" media="(device-width: 768px)">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
      ])
    )
  })

  it('renders formatDetection for disabled formats only', () => {
    expect(render({ formatDetection: { telephone: false, email: false, url: true } })).toContain(
      '<meta name="format-detection" content="telephone=no, email=no">'
    )
  })

  it('renders itunes, facebook and pinterest', () => {
    const html = render({
      itunes: { appId: '123', appArgument: 'https://example.com/open' },
      facebook: { appId: 'fb1', admins: ['a1', 'a2'] },
      pinterest: { richPin: true },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="apple-itunes-app" content="app-id=123, app-argument=https://example.com/open">',
        '<meta property="fb:app_id" content="fb1">',
        '<meta property="fb:admins" content="a1">',
        '<meta property="fb:admins" content="a2">',
        '<meta property="pinterest-rich-pin" content="true">',
      ])
    )
  })

  it('renders appLinks', () => {
    const html = render({
      appLinks: {
        ios: { url: 'app://x', app_store_id: 42 },
        android: { package: 'com.x', app_name: 'X' },
        web: { url: '/web', should_fallback: false },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="al:ios:url" content="app://x">',
        '<meta property="al:ios:app_store_id" content="42">',
        '<meta property="al:android:package" content="com.x">',
        '<meta property="al:android:app_name" content="X">',
        '<meta property="al:web:url" content="https://example.com/web">',
        '<meta property="al:web:should_fallback" content="false">',
      ])
    )
  })

  it('renders the twitter player card', () => {
    const html = render({
      twitter: {
        card: 'player',
        players: { playerUrl: '/player', streamUrl: '/stream.mp4', width: 640, height: 360 },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="twitter:card" content="player">',
        '<meta name="twitter:player" content="https://example.com/player">',
        '<meta name="twitter:player:stream" content="https://example.com/stream.mp4">',
        '<meta name="twitter:player:width" content="640">',
        '<meta name="twitter:player:height" content="360">',
      ])
    )
  })

  it('renders the twitter app card', () => {
    const html = render({
      twitter: {
        card: 'app',
        app: { name: 'X', id: { iphone: 'id1', googleplay: 'com.x' }, url: { iphone: 'x://' } },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta name="twitter:app:name:iphone" content="X">',
        '<meta name="twitter:app:id:iphone" content="id1">',
        '<meta name="twitter:app:url:iphone" content="x://">',
        '<meta name="twitter:app:name:googleplay" content="X">',
        '<meta name="twitter:app:id:googleplay" content="com.x">',
      ])
    )
  })
})

describe('createTags OpenGraph types', () => {
  it('renders the basic extra OG fields', () => {
    const html = render({
      openGraph: {
        determiner: 'the',
        countryName: 'Kosovo',
        ttl: 345600,
        emails: 'a@x.com',
        phoneNumbers: ['+1'],
        faxNumbers: '+2',
        videos: { url: '/v.mp4', type: 'video/mp4', width: 640, height: 360 },
        audio: { url: '/a.mp3', type: 'audio/mpeg' },
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="og:determiner" content="the">',
        '<meta property="og:country_name" content="Kosovo">',
        '<meta property="og:ttl" content="345600">',
        '<meta property="og:email" content="a@x.com">',
        '<meta property="og:phone_number" content="+1">',
        '<meta property="og:fax_number" content="+2">',
        '<meta property="og:video" content="https://example.com/v.mp4">',
        '<meta property="og:video:type" content="video/mp4">',
        '<meta property="og:video:width" content="640">',
        '<meta property="og:video:height" content="360">',
        '<meta property="og:audio" content="https://example.com/a.mp3">',
        '<meta property="og:audio:type" content="audio/mpeg">',
      ])
    )
  })

  it('renders article fields', () => {
    const html = render({
      openGraph: {
        type: 'article',
        publishedTime: '2026-01-01T00:00:00Z',
        modifiedTime: '2026-01-02T00:00:00Z',
        expirationTime: '2027-01-01T00:00:00Z',
        authors: ['https://example.com/ana'],
        section: 'Tech',
        tags: ['astro', 'seo'],
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="og:type" content="article">',
        '<meta property="article:published_time" content="2026-01-01T00:00:00Z">',
        '<meta property="article:modified_time" content="2026-01-02T00:00:00Z">',
        '<meta property="article:expiration_time" content="2027-01-01T00:00:00Z">',
        '<meta property="article:author" content="https://example.com/ana">',
        '<meta property="article:section" content="Tech">',
        '<meta property="article:tag" content="astro">',
        '<meta property="article:tag" content="seo">',
      ])
    )
  })

  it('does not render article fields for another OG type', () => {
    const html = render({ openGraph: { type: 'website', section: 'Tech' } })
    expect(html.some((t) => t.includes('article:section'))).toBe(false)
  })

  it('renders book fields', () => {
    const html = render({
      openGraph: {
        type: 'book',
        isbn: '978',
        releaseDate: '2026-01-01',
        authors: 'https://example.com/a',
        tags: 'novel',
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="book:isbn" content="978">',
        '<meta property="book:release_date" content="2026-01-01">',
        '<meta property="book:author" content="https://example.com/a">',
        '<meta property="book:tag" content="novel">',
      ])
    )
  })

  it('renders profile fields', () => {
    const html = render({
      openGraph: {
        type: 'profile',
        firstName: 'Ana',
        lastName: 'B',
        username: 'anab',
        gender: 'female',
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="profile:first_name" content="Ana">',
        '<meta property="profile:last_name" content="B">',
        '<meta property="profile:username" content="anab">',
        '<meta property="profile:gender" content="female">',
      ])
    )
  })

  it('renders music.song fields', () => {
    const html = render({
      openGraph: {
        type: 'music.song',
        duration: 200,
        albums: [{ url: '/album', disc: 1, track: 2 }],
        musicians: '/band',
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="music:duration" content="200">',
        '<meta property="music:album" content="https://example.com/album">',
        '<meta property="music:album:disc" content="1">',
        '<meta property="music:album:track" content="2">',
        '<meta property="music:musician" content="https://example.com/band">',
      ])
    )
  })

  it('renders music.album fields', () => {
    const html = render({
      openGraph: {
        type: 'music.album',
        songs: [{ url: '/song', track: 1 }],
        musicians: '/band',
        releaseDate: '2026-01-01',
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="music:song" content="https://example.com/song">',
        '<meta property="music:song:track" content="1">',
        '<meta property="music:musician" content="https://example.com/band">',
        '<meta property="music:release_date" content="2026-01-01">',
      ])
    )
  })

  it('renders music.playlist and music.radio_station creators', () => {
    expect(render({ openGraph: { type: 'music.playlist', songs: '/s', creators: '/dj' } })).toEqual(
      expect.arrayContaining([
        '<meta property="music:song" content="https://example.com/s">',
        '<meta property="music:creator" content="https://example.com/dj">',
      ])
    )
    expect(render({ openGraph: { type: 'music.radio_station', creators: '/dj' } })).toContain(
      '<meta property="music:creator" content="https://example.com/dj">'
    )
  })

  it('renders video.movie fields', () => {
    const html = render({
      openGraph: {
        type: 'video.movie',
        actors: [{ url: '/actor', role: 'Lead' }],
        directors: '/dir',
        writers: '/wr',
        duration: 7200,
        releaseDate: '2026-01-01',
        tags: 'drama',
      },
    })
    expect(html).toEqual(
      expect.arrayContaining([
        '<meta property="video:actor" content="https://example.com/actor">',
        '<meta property="video:actor:role" content="Lead">',
        '<meta property="video:director" content="https://example.com/dir">',
        '<meta property="video:writer" content="https://example.com/wr">',
        '<meta property="video:duration" content="7200">',
        '<meta property="video:release_date" content="2026-01-01">',
        '<meta property="video:tag" content="drama">',
      ])
    )
  })

  it('renders video.episode series', () => {
    expect(render({ openGraph: { type: 'video.episode', series: '/show' } })).toContain(
      '<meta property="video:series" content="https://example.com/show">'
    )
  })
})
