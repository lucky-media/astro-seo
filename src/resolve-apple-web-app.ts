import type { Metadata, ResolvedAppleWebApp } from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { toArray } from './utils.ts'

export function resolveAppleWebApp(
  appleWebApp: Metadata['appleWebApp'],
  metadataBase: URL | null
): ResolvedAppleWebApp | null {
  if (appleWebApp == null || appleWebApp === false) return null
  if (appleWebApp === true) {
    return { capable: true, title: null, startupImage: null, statusBarStyle: 'default' }
  }

  const startupImage = appleWebApp.startupImage
    ? toArray(appleWebApp.startupImage).map((image) => {
        const descriptor = typeof image === 'string' ? { url: image } : image
        return { ...descriptor, url: resolveUrl(descriptor.url, metadataBase) ?? descriptor.url }
      })
    : null

  return {
    capable: appleWebApp.capable ?? true,
    title: appleWebApp.title ?? null,
    startupImage,
    statusBarStyle: appleWebApp.statusBarStyle ?? 'default',
  }
}
