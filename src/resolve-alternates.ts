import type { Alternates } from './types.ts'
import { resolveUrl } from './resolve-url.ts'

export function resolveAlternates(
  alternates: Alternates | null | undefined,
  metadataBase: URL | null
): Alternates | null {
  if (alternates == null) return null
  return {
    canonical: alternates.canonical != null ? resolveUrl(alternates.canonical, metadataBase) : null,
    languages: alternates.languages
      ? Object.fromEntries(
          Object.entries(alternates.languages).map(([lang, url]) => [
            lang,
            resolveUrl(url, metadataBase) ?? url,
          ])
        )
      : undefined,
  }
}
