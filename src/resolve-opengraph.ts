import type { OpenGraph, ResolvedMetadata } from './types.ts'
import { resolveUrl } from './resolve-url.ts'

type ResolvedOG = NonNullable<ResolvedMetadata['openGraph']>

export function resolveOpenGraph(
  og: OpenGraph | null | undefined,
  metadataBase: URL | null
): ResolvedOG | null {
  if (og == null) return null

  const images = og.images
    ? (Array.isArray(og.images) ? og.images : [og.images]).map((img) => ({
        ...img,
        url: resolveUrl(img.url, metadataBase) ?? '',
        secureUrl: img.secureUrl
          ? (resolveUrl(img.secureUrl, metadataBase) ?? undefined)
          : undefined,
      }))
    : []

  return {
    type: og.type ?? 'website',
    title: og.title,
    description: og.description,
    url: og.url != null ? (resolveUrl(og.url, metadataBase) ?? undefined) : undefined,
    siteName: og.siteName,
    locale: og.locale,
    alternateLocale: og.alternateLocale,
    images,
  }
}
