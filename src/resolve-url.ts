export function resolveUrl(
  url: string | URL | null | undefined,
  metadataBase: URL | null
): string | null {
  if (url == null) return null

  const str = url instanceof URL ? url.href : url

  if (metadataBase && !str.startsWith('http://') && !str.startsWith('https://')) {
    return new URL(str, metadataBase).href
  }

  return str
}
