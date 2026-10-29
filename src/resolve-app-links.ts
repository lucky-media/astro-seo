import type { AppLinks, Metadata, ResolvedAppLinks } from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { toArray } from './utils.ts'

export function resolveAppLinks(
  appLinks: Metadata['appLinks'],
  metadataBase: URL | null
): ResolvedAppLinks | null {
  if (appLinks == null) return null

  const resolved: ResolvedAppLinks = {}
  for (const [platform, items] of Object.entries(appLinks) as [keyof AppLinks, unknown][]) {
    if (items == null) continue
    resolved[platform] = toArray(items as Record<string, string | number | boolean | URL>[]).map(
      (item) =>
        item.url != null
          ? { ...item, url: resolveUrl(item.url as string | URL, metadataBase) ?? String(item.url) }
          : { ...item }
    ) as Record<string, string | number | boolean | undefined>[]
  }
  return resolved
}
