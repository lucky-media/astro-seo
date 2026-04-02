// src/types.ts

export type TemplateString = {
  default: string
  template?: string
  absolute?: string
}

export type RobotsDirective = {
  index?: boolean
  follow?: boolean
  nocache?: boolean
  googleBot?: RobotsDirective
}

export type OpenGraphType =
  | 'website'
  | 'article'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_station'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other'

export type OpenGraphImage = {
  url: string | URL
  secureUrl?: string | URL
  alt?: string
  type?: string
  width?: number | string
  height?: number | string
}

export type OpenGraph = {
  type?: OpenGraphType
  title?: string | TemplateString
  description?: string
  url?: string | URL
  siteName?: string
  locale?: string
  alternateLocale?: string | string[]
  images?: OpenGraphImage | OpenGraphImage[]
}

export type TwitterCard = 'summary' | 'summary_large_image' | 'player' | 'app'

export type TwitterImage = { url: string | URL; alt?: string }

export type Twitter = {
  card?: TwitterCard
  site?: string
  siteId?: string
  creator?: string
  creatorId?: string
  description?: string
  title?: string | TemplateString
  images?: TwitterImage | TwitterImage[]
}

export type Icon = {
  url: string | URL
  type?: string
  sizes?: string
  rel?: string
}

export type Icons = {
  icon?: string | URL | Icon | Icon[]
  apple?: string | URL | Icon | Icon[]
  shortcut?: string | URL | Icon | Icon[]
  other?: Icon | Icon[]
}

export type Alternates = {
  canonical?: string | URL | null
  languages?: Record<string, string | URL>
  media?: Record<string, string | URL>
  types?: Record<string, string | URL>
}

export type Author = { name?: string; url?: string | URL }

export type Robots = RobotsDirective | string

export type Verification = {
  google?: string | string[]
  yahoo?: string | string[]
  yandex?: string | string[]
  me?: string | string[]
  other?: Record<string, string | string[]>
}

export interface Metadata {
  metadataBase?: URL | null
  title?: string | TemplateString | null
  description?: string | null
  applicationName?: string | null
  authors?: Author | Author[] | null
  generator?: string | null
  keywords?: string | string[] | null
  referrer?: string | null
  creator?: string | null
  publisher?: string | null
  robots?: Robots | null
  alternates?: Alternates | null
  icons?: Icons | null
  manifest?: string | URL | null
  openGraph?: OpenGraph | null
  twitter?: Twitter | null
  verification?: Verification
  category?: string | null
  classification?: string | null
  other?: Record<string, string | string[]>
}

export interface ResolvedMetadata {
  metadataBase: URL | null
  title: string | null
  titleTemplate: string | null
  description: string | null
  applicationName: string | null
  authors: Author | Author[] | null
  generator: string | null
  keywords: string | string[] | null
  referrer: string | null
  creator: string | null
  publisher: string | null
  robots: string | null
  alternates: Alternates | null
  icons: Icons | null
  manifest: string | null
  openGraph: (Omit<OpenGraph, 'images'> & { images: OpenGraphImage[] }) | null
  twitter: Twitter | null
  verification: Verification
  category: string | null
  classification: string | null
  other: Record<string, string | string[]>
}
