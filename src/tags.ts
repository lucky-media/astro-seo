// src/tags.ts
import type { ResolvedAlternates, ResolvedIcon, ResolvedMetadata } from './types.ts'
import { toArray } from './utils.ts'

export type Tag =
  | { tag: 'title'; content: string }
  | { tag: 'meta' | 'link'; attrs: Record<string, string> }

type Value = string | number | boolean | null | undefined

type Attrs = Record<string, Value>

function clean(attrs: Attrs): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null && value !== '') result[key] = String(value)
  }
  return result
}

const formatDetectionKeys = ['telephone', 'date', 'address', 'email', 'url'] as const

const twitterAppPlatforms = ['iphone', 'ipad', 'googleplay'] as const

// Builds the list of <title>, <meta> and <link> tags for a resolved metadata object.
// `currentUrl` is the fallback for the canonical link and og:url.
export function createTags(metadata: ResolvedMetadata, currentUrl?: string | URL): Tag[] {
  const tags: Tag[] = []
  const meta = (attrs: Attrs) => tags.push({ tag: 'meta', attrs: clean(attrs) })
  const link = (attrs: Attrs) => tags.push({ tag: 'link', attrs: clean(attrs) })
  const named = (name: string, content: Value) => {
    if (content != null && content !== '') meta({ name, content })
  }
  const property = (name: string, content: Value) => {
    if (content != null && content !== '') meta({ property: name, content })
  }
  const properties = (name: string, values: Value[] | undefined) => {
    for (const value of values ?? []) property(name, value)
  }
  const links = (rel: string, hrefs: string[] | null) => {
    for (const href of hrefs ?? []) link({ rel, href })
  }

  if (metadata.title) tags.push({ tag: 'title', content: metadata.title })
  named('description', metadata.description)
  named('application-name', metadata.applicationName)
  for (const author of metadata.authors ?? []) {
    if (author.url) link({ rel: 'author', href: author.url })
    named('author', author.name)
  }
  named('generator', metadata.generator)
  if (metadata.keywords) named('keywords', toArray(metadata.keywords).join(', '))
  named('referrer', metadata.referrer)
  named('creator', metadata.creator)
  named('publisher', metadata.publisher)
  named('robots', metadata.robots)
  named('googlebot', metadata.googleBot)
  named('abstract', metadata.abstract)
  named('category', metadata.category)
  named('classification', metadata.classification)

  named('viewport', metadata.viewport)
  for (const { color, media } of metadata.themeColor ?? []) {
    meta({ name: 'theme-color', content: color, media })
  }
  named('color-scheme', metadata.colorScheme)

  const canonical = metadata.alternates?.canonical ?? currentUrl
  if (canonical) {
    link(
      typeof canonical === 'object' && !(canonical instanceof URL)
        ? { rel: 'canonical', href: canonical.url, title: canonical.title }
        : { rel: 'canonical', href: String(canonical) }
    )
  }
  alternateLinks(metadata.alternates?.languages, 'hreflang', link)
  alternateLinks(metadata.alternates?.media, 'media', link)
  alternateLinks(metadata.alternates?.types, 'type', link)

  links('archives', metadata.archives)
  links('assets', metadata.assets)
  links('bookmarks', metadata.bookmarks)
  if (metadata.pagination?.previous) link({ rel: 'prev', href: metadata.pagination.previous })
  if (metadata.pagination?.next) link({ rel: 'next', href: metadata.pagination.next })

  iconLinks(metadata.icons?.shortcut, 'shortcut icon', link)
  iconLinks(metadata.icons?.icon, 'icon', link)
  iconLinks(metadata.icons?.apple, 'apple-touch-icon', link)
  iconLinks(metadata.icons?.other, 'icon', link)
  if (metadata.manifest) link({ rel: 'manifest', href: metadata.manifest })

  if (metadata.itunes) {
    const { appId, appArgument } = metadata.itunes
    named(
      'apple-itunes-app',
      `app-id=${appId}${appArgument ? `, app-argument=${appArgument}` : ''}`
    )
  }

  if (metadata.appleWebApp) {
    const { capable, title, startupImage, statusBarStyle } = metadata.appleWebApp
    if (capable) named('mobile-web-app-capable', 'yes')
    named('apple-mobile-web-app-title', title)
    for (const image of startupImage ?? []) {
      link({ rel: 'apple-touch-startup-image', href: image.url, media: image.media })
    }
    named('apple-mobile-web-app-status-bar-style', statusBarStyle)
  }

  if (metadata.formatDetection) {
    const disabled = formatDetectionKeys.filter((key) => metadata.formatDetection?.[key] === false)
    if (disabled.length > 0) {
      named('format-detection', disabled.map((key) => `${key}=no`).join(', '))
    }
  }

  const { verification } = metadata
  for (const value of toArray(verification.google)) named('google-site-verification', value)
  for (const value of toArray(verification.yahoo)) named('y_key', value)
  for (const value of toArray(verification.yandex)) named('yandex-verification', value)
  for (const value of toArray(verification.me)) named('me', value)
  for (const [name, values] of Object.entries(verification.other ?? {})) {
    for (const value of toArray(values)) named(name, value)
  }

  property('fb:app_id', metadata.facebook?.appId)
  properties('fb:admins', metadata.facebook?.admins)
  if (metadata.pinterest) property('pinterest-rich-pin', String(metadata.pinterest.richPin))

  const og = metadata.openGraph
  property('og:determiner', og?.determiner)
  property('og:title', og?.title)
  property('og:description', og?.description)
  property('og:type', og?.type)
  property('og:url', og?.url ?? (currentUrl ? String(currentUrl) : undefined))
  property('og:site_name', og?.siteName)
  property('og:locale', og?.locale)
  property('og:country_name', og?.countryName)
  property('og:ttl', og?.ttl)
  for (const image of og?.images ?? []) {
    property('og:image', image.url)
    property('og:image:secure_url', image.secureUrl)
    property('og:image:alt', image.alt)
    property('og:image:width', image.width)
    property('og:image:height', image.height)
    property('og:image:type', image.type)
  }
  for (const video of og?.videos ?? []) {
    property('og:video', video.url)
    property('og:video:secure_url', video.secureUrl)
    property('og:video:type', video.type)
    property('og:video:width', video.width)
    property('og:video:height', video.height)
  }
  for (const audio of og?.audio ?? []) {
    property('og:audio', audio.url)
    property('og:audio:secure_url', audio.secureUrl)
    property('og:audio:type', audio.type)
  }
  properties('og:email', og?.emails)
  properties('og:phone_number', og?.phoneNumbers)
  properties('og:fax_number', og?.faxNumbers)
  properties('og:locale:alternate', og?.alternateLocale)

  // Type-specific fields render only for their OpenGraph type.
  switch (og?.type) {
    case 'article':
      property('article:published_time', og.publishedTime)
      property('article:modified_time', og.modifiedTime)
      property('article:expiration_time', og.expirationTime)
      properties('article:author', og.authors)
      property('article:section', og.section)
      properties('article:tag', og.tags)
      break
    case 'book':
      property('book:isbn', og.isbn)
      property('book:release_date', og.releaseDate)
      properties('book:author', og.authors)
      properties('book:tag', og.tags)
      break
    case 'profile':
      property('profile:first_name', og.firstName)
      property('profile:last_name', og.lastName)
      property('profile:username', og.username)
      property('profile:gender', og.gender)
      break
    case 'music.song':
      property('music:duration', og.duration)
      for (const album of og.albums ?? []) {
        property('music:album', album.url)
        property('music:album:disc', album.disc)
        property('music:album:track', album.track)
      }
      properties('music:musician', og.musicians)
      break
    case 'music.album':
    case 'music.playlist':
      for (const song of og.songs ?? []) {
        property('music:song', song.url)
        property('music:song:disc', song.disc)
        property('music:song:track', song.track)
      }
      if (og.type === 'music.album') {
        properties('music:musician', og.musicians)
        property('music:release_date', og.releaseDate)
      } else {
        properties('music:creator', og.creators)
      }
      break
    case 'music.radio_station':
      properties('music:creator', og.creators)
      break
    case 'video.movie':
    case 'video.episode':
      for (const actor of og.actors ?? []) {
        property('video:actor', actor.url)
        property('video:actor:role', actor.role)
      }
      properties('video:director', og.directors)
      properties('video:writer', og.writers)
      property('video:duration', og.duration)
      property('video:release_date', og.releaseDate)
      properties('video:tag', og.tags)
      if (og.type === 'video.episode') property('video:series', og.series)
      break
  }

  const twitter = metadata.twitter
  named('twitter:card', twitter?.card)
  named('twitter:site', twitter?.site)
  named('twitter:site:id', twitter?.siteId)
  named('twitter:creator', twitter?.creator)
  named('twitter:creator:id', twitter?.creatorId)
  named('twitter:title', twitter?.title)
  named('twitter:description', twitter?.description)
  for (const image of twitter?.images ?? []) {
    named('twitter:image', image.url)
    named('twitter:image:alt', image.alt)
    named('twitter:image:secure_url', image.secureUrl)
    named('twitter:image:type', image.type)
    named('twitter:image:width', image.width)
    named('twitter:image:height', image.height)
  }
  if (twitter?.card === 'player') {
    for (const player of twitter.players ?? []) {
      named('twitter:player', player.playerUrl)
      named('twitter:player:stream', player.streamUrl)
      named('twitter:player:width', player.width)
      named('twitter:player:height', player.height)
    }
  }
  if (twitter?.card === 'app' && twitter.app) {
    const { app } = twitter
    for (const platform of twitterAppPlatforms) {
      named(`twitter:app:name:${platform}`, app.name)
      named(`twitter:app:id:${platform}`, app.id[platform])
      named(`twitter:app:url:${platform}`, app.url?.[platform])
    }
  }

  for (const [platform, items] of Object.entries(metadata.appLinks ?? {})) {
    for (const item of items ?? []) {
      for (const [key, value] of Object.entries(item)) property(`al:${platform}:${key}`, value)
    }
  }

  for (const [name, value] of Object.entries(metadata.other)) {
    for (const item of toArray(value)) named(name, item)
  }

  return tags
}

function alternateLinks(
  entries: ResolvedAlternates['languages'],
  attribute: 'hreflang' | 'media' | 'type',
  link: (attrs: Attrs) => void
) {
  for (const [key, value] of Object.entries(entries ?? {})) {
    for (const descriptor of typeof value === 'string' ? [{ url: value }] : value) {
      link({ rel: 'alternate', [attribute]: key, href: descriptor.url, title: descriptor.title })
    }
  }
}

function iconLinks(
  icons: ResolvedIcon[] | undefined,
  defaultRel: string,
  link: (attrs: Attrs) => void
) {
  for (const { url, rel, fetchPriority, ...rest } of icons ?? []) {
    link({ rel: rel ?? defaultRel, href: url, ...rest, fetchpriority: fetchPriority })
  }
}
