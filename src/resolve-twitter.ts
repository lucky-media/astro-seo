import type { Twitter, TwitterCard, ResolvedTwitter } from './types.ts'
import { resolveUrl } from './resolve-url.ts'
import { resolveTitle, extractTitleTemplate } from './resolve-title.ts'
import { resolveMedia } from './resolve-opengraph.ts'
import { toArray } from './utils.ts'

function resolveAppUrls(
  urls: NonNullable<Twitter['app']>['url'],
  metadataBase: URL | null
): NonNullable<ResolvedTwitter['app']>['url'] {
  if (!urls) return undefined
  return Object.fromEntries(
    Object.entries(urls).map(([platform, url]) => [platform, resolveUrl(url, metadataBase)])
  )
}

export function inferCard(images: unknown[] | undefined): TwitterCard {
  return images && images.length > 0 ? 'summary_large_image' : 'summary'
}

export function mergeTwitter(
  parent: ResolvedTwitter | null,
  child: Twitter | null | undefined,
  metadataBase: URL | null
): ResolvedTwitter | null {
  if (child === null) return null
  if (child === undefined) return parent

  const fields: Partial<ResolvedTwitter> = {}
  for (const key of ['site', 'siteId', 'creator', 'creatorId', 'description'] as const) {
    if (child[key] !== undefined) fields[key] = child[key]
  }
  if (child.title != null) {
    fields.title = resolveTitle(child.title, parent?.titleTemplate ?? null) ?? undefined
  }
  if (child.images !== undefined) {
    const images = resolveMedia(child.images, metadataBase)
    fields.images = images.length > 0 ? images : undefined
  }
  if (child.players !== undefined) {
    fields.players = toArray(child.players).map((player) => ({
      ...player,
      playerUrl: resolveUrl(player.playerUrl, metadataBase) ?? String(player.playerUrl),
      streamUrl: resolveUrl(player.streamUrl, metadataBase) ?? String(player.streamUrl),
    }))
  }
  if (child.app !== undefined) {
    fields.app = { ...child.app, url: resolveAppUrls(child.app.url, metadataBase) }
  }

  const images = child.images !== undefined ? fields.images : parent?.images
  const explicitCard = child.card ?? (parent && !parent.cardInferred ? parent.card : undefined)
  return {
    ...parent,
    ...fields,
    images,
    card: explicitCard ?? inferCard(images),
    cardInferred: explicitCard === undefined,
    titleTemplate: extractTitleTemplate(child.title) ?? parent?.titleTemplate ?? null,
  }
}

export function resolveTwitter(
  twitter: Twitter | null | undefined,
  metadataBase: URL | null
): ResolvedTwitter | null {
  if (twitter == null) return null
  return mergeTwitter(null, twitter, metadataBase)
}
