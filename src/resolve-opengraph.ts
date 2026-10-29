import type { OpenGraph, ResolvedOpenGraph } from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { resolveTitle, extractTitleTemplate } from './resolve-title.ts'
import { toArray, isUrlLike, stripUndefined } from './utils.ts'

type MediaDescriptor = { url: string | URL; secureUrl?: string | URL }

type ResolvedMedia<D> = Omit<D, 'url' | 'secureUrl'> & { url: string; secureUrl?: string }

// Normalizes images, videos and audio: a bare string or URL becomes `{ url }`, relative URLs
// resolve against metadataBase, and items without a URL are dropped.
export function resolveMedia<D extends MediaDescriptor>(
  items: string | URL | D | (string | URL | D)[] | null | undefined,
  metadataBase: URL | null
): ResolvedMedia<D>[] {
  const resolved: ResolvedMedia<D>[] = []
  for (const item of toArray(items)) {
    const descriptor = (isUrlLike(item) ? { url: item } : item) as MediaDescriptor
    if (!descriptor.url) continue
    const url = resolveUrl(descriptor.url, metadataBase)
    if (!url) continue
    const result: Record<string, unknown> = { ...descriptor, url }
    if (descriptor.secureUrl) result.secureUrl = resolveUrl(descriptor.secureUrl, metadataBase)
    resolved.push(result as ResolvedMedia<D>)
  }
  return resolved
}

function resolveUrls(
  items: string | URL | (string | URL)[] | undefined,
  metadataBase: URL | null
): string[] | undefined {
  if (items === undefined) return undefined
  return toArray(items).map((item) => resolveUrl(item, metadataBase) ?? String(item))
}

function resolveLinked<T extends { url: string | URL }>(
  items: string | URL | T | (string | URL | T)[] | undefined,
  metadataBase: URL | null
): (Omit<T, 'url'> & { url: string })[] | undefined {
  if (items === undefined) return undefined
  return toArray(items).map((item) => {
    const descriptor = isUrlLike(item) ? { url: item } : item
    return {
      ...descriptor,
      url: resolveUrl(descriptor.url, metadataBase) ?? String(descriptor.url),
    }
  }) as (Omit<T, 'url'> & { url: string })[]
}

// Resolves only the fields that `og` sets. Unset fields stay undefined so a merge can
// keep the parent values.
function resolveOpenGraphFields(
  og: OpenGraph,
  metadataBase: URL | null,
  titleTemplate: string | null
): Partial<ResolvedOpenGraph> {
  return stripUndefined({
    ...og,
    title: og.title != null ? (resolveTitle(og.title, titleTemplate) ?? undefined) : undefined,
    titleTemplate: extractTitleTemplate(og.title) ?? undefined,
    url: og.url != null ? (resolveUrl(og.url, metadataBase) ?? undefined) : undefined,
    alternateLocale: og.alternateLocale !== undefined ? toArray(og.alternateLocale) : undefined,
    images: og.images !== undefined ? resolveMedia(og.images, metadataBase) : undefined,
    videos: og.videos !== undefined ? resolveMedia(og.videos, metadataBase) : undefined,
    audio: og.audio !== undefined ? resolveMedia(og.audio, metadataBase) : undefined,
    emails: og.emails !== undefined ? toArray(og.emails) : undefined,
    phoneNumbers: og.phoneNumbers !== undefined ? toArray(og.phoneNumbers) : undefined,
    faxNumbers: og.faxNumbers !== undefined ? toArray(og.faxNumbers) : undefined,
    tags: og.tags !== undefined ? toArray(og.tags) : undefined,
    authors: resolveUrls(og.authors, metadataBase),
    musicians: resolveUrls(og.musicians, metadataBase),
    creators: resolveUrls(og.creators, metadataBase),
    directors: resolveUrls(og.directors, metadataBase),
    writers: resolveUrls(og.writers, metadataBase),
    series: og.series != null ? (resolveUrl(og.series, metadataBase) ?? undefined) : undefined,
    albums: resolveLinked(og.albums, metadataBase),
    songs: resolveLinked(og.songs, metadataBase),
    actors: resolveLinked(og.actors, metadataBase),
  } as Partial<ResolvedOpenGraph>)
}

export function mergeOpenGraph(
  parent: ResolvedOpenGraph | null,
  child: OpenGraph | null | undefined,
  metadataBase: URL | null
): ResolvedOpenGraph | null {
  if (child === null) return null
  if (child === undefined) return parent

  const fields = resolveOpenGraphFields(child, metadataBase, parent?.titleTemplate ?? null)
  return {
    ...parent,
    ...fields,
    type: fields.type ?? parent?.type ?? 'website',
    images: fields.images ?? parent?.images ?? [],
    titleTemplate: fields.titleTemplate ?? parent?.titleTemplate ?? null,
  }
}

export function resolveOpenGraph(
  og: OpenGraph | null | undefined,
  metadataBase: URL | null
): ResolvedOpenGraph | null {
  if (og == null) return null
  return mergeOpenGraph(null, og, metadataBase)
}
