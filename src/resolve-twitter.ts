import type { Twitter } from './types.ts'
import { resolveUrl } from './resolve-url.ts'

export function resolveTwitter(
  twitter: Twitter | null | undefined,
  metadataBase: URL | null
): Twitter | null {
  if (twitter == null) return null

  const rawImages = twitter.images
    ? Array.isArray(twitter.images)
      ? twitter.images
      : [twitter.images]
    : []

  const images = rawImages.map((img) => ({
    ...img,
    url: resolveUrl(img.url, metadataBase) ?? '',
  }))

  return {
    ...twitter,
    card: twitter.card ?? (images.length > 0 ? 'summary_large_image' : 'summary'),
    images: images.length > 0 ? images : undefined,
  }
}
