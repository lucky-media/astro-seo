import type { Icons, Icon } from './types.ts'
import { resolveUrl } from './resolve-url.ts'

function normalizeIcons(
  icon: string | URL | Icon | (string | URL | Icon)[],
  base: URL | null
): Icon[] {
  return (Array.isArray(icon) ? icon : [icon]).map((i) => {
    if (typeof i === 'string' || i instanceof URL) return { url: resolveUrl(i, base) ?? String(i) }
    return { ...i, url: resolveUrl(i.url, base) ?? String(i.url) }
  })
}

export function resolveIcons(
  icons: Icons | null | undefined,
  metadataBase: URL | null
): Icons | null {
  if (icons == null) return null
  return {
    icon: icons.icon != null ? normalizeIcons(icons.icon, metadataBase) : undefined,
    apple: icons.apple != null ? normalizeIcons(icons.apple, metadataBase) : undefined,
    shortcut: icons.shortcut != null ? normalizeIcons(icons.shortcut, metadataBase) : undefined,
    other: icons.other != null ? normalizeIcons(icons.other, metadataBase) : undefined,
  }
}
