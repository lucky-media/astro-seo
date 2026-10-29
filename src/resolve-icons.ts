import type { Icons, Icon, Metadata, ResolvedIcon, ResolvedIcons } from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { toArray, isUrlLike } from './utils.ts'

function normalizeIcons(
  icon: string | URL | Icon | (string | URL | Icon)[],
  base: URL | null
): ResolvedIcon[] {
  return toArray(icon).map((i) => {
    if (isUrlLike(i)) return { url: resolveUrl(i, base) ?? String(i) }
    return { ...i, url: resolveUrl(i.url, base) ?? String(i.url) }
  })
}

export function resolveIcons(
  icons: Metadata['icons'],
  metadataBase: URL | null
): ResolvedIcons | null {
  if (icons == null) return null
  if (isUrlLike(icons) || Array.isArray(icons)) {
    return { icon: normalizeIcons(icons, metadataBase) }
  }

  const resolved: ResolvedIcons = {}
  for (const key of ['icon', 'apple', 'shortcut', 'other'] as const satisfies (keyof Icons)[]) {
    const value = icons[key]
    if (value != null) resolved[key] = normalizeIcons(value, metadataBase)
  }
  return resolved
}
