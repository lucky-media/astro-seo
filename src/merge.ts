import type { Metadata, ResolvedMetadata, OpenGraph, Twitter } from './types.ts'
import { resolveTitle, extractTitleTemplate } from './resolve-title.ts'
import { resolveOpenGraph } from './resolve-opengraph.ts'
import { resolveTwitter } from './resolve-twitter.ts'
import { resolveRobots } from './resolve-robots.ts'
import { resolveAlternates } from './resolve-alternates.ts'
import { resolveIcons } from './resolve-icons.ts'
import { resolveUrl } from './resolve-url.ts'

function mergeOpenGraph(
  parent: ResolvedMetadata['openGraph'],
  child: OpenGraph | null | undefined
): OpenGraph | null | undefined {
  if (child === null) return null
  if (child === undefined) return undefined
  if (parent == null) return child

  return {
    type: child.type ?? parent.type,
    title: child.title ?? parent.title,
    description: child.description ?? parent.description,
    url: child.url ?? parent.url,
    siteName: child.siteName ?? parent.siteName,
    locale: child.locale ?? parent.locale,
    alternateLocale: child.alternateLocale ?? parent.alternateLocale,
    images: child.images !== undefined ? child.images : parent.images,
  }
}

function mergeTwitter(
  parent: ResolvedMetadata['twitter'],
  child: Twitter | null | undefined
): Twitter | null | undefined {
  if (child === null) return null
  if (child === undefined) return undefined
  if (parent == null) return child

  return {
    card: child.card ?? parent.card,
    site: child.site ?? parent.site,
    siteId: child.siteId ?? parent.siteId,
    creator: child.creator ?? parent.creator,
    creatorId: child.creatorId ?? parent.creatorId,
    description: child.description ?? parent.description,
    title: child.title ?? parent.title,
    images: child.images !== undefined ? child.images : parent.images,
  }
}

export function mergeMetadata(parent: ResolvedMetadata, child: Metadata): ResolvedMetadata {
  const base = child.metadataBase ?? parent.metadataBase ?? null

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
    authors: child.authors !== undefined ? child.authors : parent.authors,
    generator: child.generator !== undefined ? child.generator : parent.generator,
    keywords: child.keywords !== undefined ? child.keywords : parent.keywords,
    referrer: child.referrer !== undefined ? child.referrer : parent.referrer,
    creator: child.creator !== undefined ? child.creator : parent.creator,
    publisher: child.publisher !== undefined ? child.publisher : parent.publisher,
    robots: child.robots !== undefined ? resolveRobots(child.robots) : parent.robots,
    alternates:
      child.alternates !== undefined
        ? resolveAlternates(child.alternates, base)
        : parent.alternates,
    icons: child.icons !== undefined ? resolveIcons(child.icons, base) : parent.icons,
    manifest:
      child.manifest !== undefined ? resolveUrl(child.manifest ?? null, base) : parent.manifest,
    openGraph:
      child.openGraph !== undefined
        ? resolveOpenGraph(mergeOpenGraph(parent.openGraph, child.openGraph), base)
        : parent.openGraph,
    twitter:
      child.twitter !== undefined
        ? resolveTwitter(mergeTwitter(parent.twitter, child.twitter), base)
        : parent.twitter,
    verification:
      child.verification !== undefined
        ? { ...parent.verification, ...child.verification }
        : parent.verification,
    category: child.category !== undefined ? child.category : parent.category,
    classification:
      child.classification !== undefined ? child.classification : parent.classification,
    other: child.other !== undefined ? { ...parent.other, ...child.other } : parent.other,
  }
}
