import type {
  Alternates,
  AlternateLinkDescriptor,
  ResolvedAlternateLink,
  ResolvedAlternates,
} from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { isUrlLike } from './utils.ts'

function resolveDescriptor(
  descriptor: AlternateLinkDescriptor,
  metadataBase: URL | null
): ResolvedAlternateLink {
  return {
    ...descriptor,
    url: resolveUrl(descriptor.url, metadataBase) ?? String(descriptor.url),
  }
}

function resolveLinkMap(
  links: Alternates['languages'],
  metadataBase: URL | null
): ResolvedAlternates['languages'] {
  if (!links) return undefined
  return Object.fromEntries(
    Object.entries(links).map(([key, value]) => [
      key,
      isUrlLike(value)
        ? (resolveUrl(value, metadataBase) ?? String(value))
        : value.map((descriptor) => resolveDescriptor(descriptor, metadataBase)),
    ])
  )
}

export function resolveAlternates(
  alternates: Alternates | null | undefined,
  metadataBase: URL | null
): ResolvedAlternates | null {
  if (alternates == null) return null
  const { canonical } = alternates
  return {
    canonical:
      canonical == null
        ? null
        : isUrlLike(canonical)
          ? resolveUrl(canonical, metadataBase)
          : resolveDescriptor(canonical, metadataBase),
    languages: resolveLinkMap(alternates.languages, metadataBase),
    media: resolveLinkMap(alternates.media, metadataBase),
    types: resolveLinkMap(alternates.types, metadataBase),
  }
}
