import type { Metadata, ResolvedMetadata, ResolvedTwitter } from './types.ts'
import { resolveTitle, extractTitleTemplate } from './resolve-title.ts'
import { mergeOpenGraph } from './resolve-opengraph.ts'
import { mergeTwitter, inferCard } from './resolve-twitter.ts'
import { resolveRobots, resolveGoogleBot } from './resolve-robots.ts'
import { resolveAlternates } from './resolve-alternates.ts'
import { resolveIcons } from './resolve-icons.ts'
import { resolveUrl } from './resolve-url.ts'
import { resolveViewport, resolveThemeColor } from './resolve-viewport.ts'
import { resolveAppleWebApp } from './resolve-apple-web-app.ts'
import { resolveAppLinks } from './resolve-app-links.ts'
import { stripUndefined, toArray } from './utils.ts'

// Runs once on the final page metadata, never between merges. It fills empty twitter fields
// from OpenGraph, then fills empty OpenGraph and twitter titles and descriptions from the
// document title and description. This mirrors postProcessMetadata() in Next.js.
export function postProcessMetadata(resolved: ResolvedMetadata): ResolvedMetadata {
  const { openGraph } = resolved
  let twitter = resolved.twitter

  if (openGraph) {
    const fill: Partial<ResolvedTwitter> = {}
    if (!twitter?.title) fill.title = openGraph.title || resolved.title || undefined
    if (!twitter?.description) {
      fill.description = openGraph.description || resolved.description || undefined
    }
    if (!twitter?.images?.length && openGraph.images.length) {
      fill.images = openGraph.images.map((image) => ({ ...image }))
    }

    const merged = { ...twitter, ...stripUndefined(fill) }
    twitter = {
      ...merged,
      card: twitter && !twitter.cardInferred ? twitter.card : inferCard(merged.images),
    }
  }

  return {
    ...resolved,
    openGraph: openGraph && inheritTitleAndDescription(openGraph, resolved),
    twitter: twitter && inheritTitleAndDescription(twitter, resolved),
  }
}

function inheritTitleAndDescription<T extends { title?: string; description?: string }>(
  target: T,
  resolved: ResolvedMetadata
): T {
  return {
    ...target,
    title: target.title || resolved.title || undefined,
    description: target.description || resolved.description || undefined,
  }
}

function resolveUrlList(
  urls: string | string[] | null | undefined,
  metadataBase: URL | null
): string[] | null {
  if (urls == null) return null
  return toArray(urls).map((url) => resolveUrl(url, metadataBase) ?? url)
}

function pick<K extends keyof Metadata, R>(
  child: Metadata,
  parent: ResolvedMetadata,
  key: K & keyof ResolvedMetadata,
  resolve: (value: NonNullable<Metadata[K]>) => R
): R | ResolvedMetadata[K & keyof ResolvedMetadata] | null {
  const value = child[key]
  if (value === undefined) return parent[key]
  if (value === null) return null
  return resolve(value as NonNullable<Metadata[K]>)
}

export function mergeMetadata(parent: ResolvedMetadata, child: Metadata): ResolvedMetadata {
  const base = child.metadataBase ?? parent.metadataBase ?? null
  const keep = <T>(value: T) => value

  return {
    metadataBase: base,
    title: child.title != null ? resolveTitle(child.title, parent.titleTemplate) : parent.title,
    titleTemplate:
      child.title != null
        ? (extractTitleTemplate(child.title) ?? parent.titleTemplate)
        : parent.titleTemplate,
    description: child.description !== undefined ? child.description : parent.description,
    applicationName:
      child.applicationName !== undefined ? child.applicationName : parent.applicationName,
    authors: pick(child, parent, 'authors', (authors) =>
      toArray(authors).map((author) =>
        stripUndefined({
          ...author,
          url: author.url != null ? (resolveUrl(author.url, base) ?? undefined) : undefined,
        })
      )
    ),
    generator: child.generator !== undefined ? child.generator : parent.generator,
    keywords: child.keywords !== undefined ? child.keywords : parent.keywords,
    referrer: child.referrer !== undefined ? child.referrer : parent.referrer,
    creator: child.creator !== undefined ? child.creator : parent.creator,
    publisher: child.publisher !== undefined ? child.publisher : parent.publisher,
    robots: child.robots !== undefined ? resolveRobots(child.robots) : parent.robots,
    googleBot: child.robots !== undefined ? resolveGoogleBot(child.robots) : parent.googleBot,
    alternates:
      child.alternates !== undefined
        ? resolveAlternates(child.alternates, base)
        : parent.alternates,
    icons: child.icons !== undefined ? resolveIcons(child.icons, base) : parent.icons,
    manifest:
      child.manifest !== undefined ? resolveUrl(child.manifest ?? null, base) : parent.manifest,
    openGraph: mergeOpenGraph(parent.openGraph, child.openGraph, base),
    twitter: mergeTwitter(parent.twitter, child.twitter, base),
    verification:
      child.verification !== undefined
        ? { ...parent.verification, ...child.verification }
        : parent.verification,
    category: child.category !== undefined ? child.category : parent.category,
    classification:
      child.classification !== undefined ? child.classification : parent.classification,
    abstract: pick(child, parent, 'abstract', keep),
    archives: pick(child, parent, 'archives', (urls) => resolveUrlList(urls, base)),
    assets: pick(child, parent, 'assets', (urls) => resolveUrlList(urls, base)),
    bookmarks: pick(child, parent, 'bookmarks', (urls) => resolveUrlList(urls, base)),
    pagination: pick(child, parent, 'pagination', (pagination) => ({
      previous: resolveUrl(pagination.previous, base),
      next: resolveUrl(pagination.next, base),
    })),
    viewport: pick(child, parent, 'viewport', resolveViewport),
    themeColor: pick(child, parent, 'themeColor', resolveThemeColor),
    colorScheme: pick(child, parent, 'colorScheme', keep),
    appleWebApp: pick(child, parent, 'appleWebApp', (value) => resolveAppleWebApp(value, base)),
    formatDetection: pick(child, parent, 'formatDetection', keep),
    itunes: pick(child, parent, 'itunes', (itunes) =>
      stripUndefined({
        appId: itunes.appId,
        appArgument: resolveUrl(itunes.appArgument, base) ?? undefined,
      })
    ) as ResolvedMetadata['itunes'],
    appLinks: pick(child, parent, 'appLinks', (value) => resolveAppLinks(value, base)),
    facebook: pick(child, parent, 'facebook', (facebook) =>
      stripUndefined({
        appId: facebook.appId,
        admins: facebook.admins !== undefined ? toArray(facebook.admins) : undefined,
      })
    ),
    pinterest: pick(child, parent, 'pinterest', keep),
    other: child.other !== undefined ? { ...parent.other, ...child.other } : parent.other,
  }
}
