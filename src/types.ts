// src/types.ts

export type TemplateString = {
  default?: string
  template?: string
  absolute?: string
}

export type RobotsInfo = {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
  noimageindex?: boolean
  nocache?: boolean
  notranslate?: boolean
  indexifembedded?: boolean
  nositelinkssearchbox?: boolean
  unavailable_after?: string
  'max-video-preview'?: number | string
  'max-image-preview'?: 'none' | 'standard' | 'large'
  'max-snippet'?: number
}

export type RobotsDirective = RobotsInfo & {
  googleBot?: string | RobotsInfo
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

export type OpenGraphVideo = {
  url: string | URL
  secureUrl?: string | URL
  type?: string
  width?: number | string
  height?: number | string
}

export type OpenGraphAudio = {
  url: string | URL
  secureUrl?: string | URL
  type?: string
}

export type OpenGraphSong = { url: string | URL; disc?: number; track?: number }

export type OpenGraphActor = { url: string | URL; role?: string }

type OneOrMany<T> = T | T[]

type UrlLike = string | URL

export type OpenGraph = {
  type?: OpenGraphType
  title?: string | TemplateString
  description?: string
  url?: string | URL
  siteName?: string
  locale?: string
  alternateLocale?: string | string[]
  images?: OneOrMany<UrlLike | OpenGraphImage>
  videos?: OneOrMany<UrlLike | OpenGraphVideo>
  audio?: OneOrMany<UrlLike | OpenGraphAudio>
  determiner?: 'a' | 'an' | 'the' | 'auto' | ''
  emails?: string | string[]
  phoneNumbers?: string | string[]
  faxNumbers?: string | string[]
  countryName?: string
  ttl?: number
  // article, book
  publishedTime?: string
  modifiedTime?: string
  expirationTime?: string
  authors?: OneOrMany<UrlLike>
  section?: string
  tags?: string | string[]
  isbn?: string
  releaseDate?: string
  // profile
  firstName?: string
  lastName?: string
  username?: string
  gender?: string
  // music
  duration?: number
  albums?: OneOrMany<UrlLike | OpenGraphSong>
  songs?: OneOrMany<UrlLike | OpenGraphSong>
  musicians?: OneOrMany<UrlLike>
  creators?: OneOrMany<UrlLike>
  // video
  actors?: OneOrMany<UrlLike | OpenGraphActor>
  directors?: OneOrMany<UrlLike>
  writers?: OneOrMany<UrlLike>
  series?: UrlLike
}

export type ResolvedOpenGraphImage = Omit<OpenGraphImage, 'url' | 'secureUrl'> & {
  url: string
  secureUrl?: string
}

export type ResolvedOpenGraph = {
  type: OpenGraphType
  title?: string
  titleTemplate?: string | null
  description?: string
  url?: string
  siteName?: string
  locale?: string
  alternateLocale?: string[]
  images: ResolvedOpenGraphImage[]
  videos?: (Omit<OpenGraphVideo, 'url' | 'secureUrl'> & { url: string; secureUrl?: string })[]
  audio?: (Omit<OpenGraphAudio, 'url' | 'secureUrl'> & { url: string; secureUrl?: string })[]
  determiner?: OpenGraph['determiner']
  emails?: string[]
  phoneNumbers?: string[]
  faxNumbers?: string[]
  countryName?: string
  ttl?: number
  publishedTime?: string
  modifiedTime?: string
  expirationTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
  isbn?: string
  releaseDate?: string
  firstName?: string
  lastName?: string
  username?: string
  gender?: string
  duration?: number
  albums?: { url: string; disc?: number; track?: number }[]
  songs?: { url: string; disc?: number; track?: number }[]
  musicians?: string[]
  creators?: string[]
  actors?: { url: string; role?: string }[]
  directors?: string[]
  writers?: string[]
  series?: string
}

export type TwitterCard = 'summary' | 'summary_large_image' | 'player' | 'app'

export type TwitterImage = {
  url: string | URL
  alt?: string
  secureUrl?: string | URL
  type?: string
  width?: number | string
  height?: number | string
}

export type TwitterPlayer = {
  playerUrl: string | URL
  streamUrl: string | URL
  width: number
  height: number
}

export type TwitterApp = {
  id: { iphone?: string | number; ipad?: string | number; googleplay?: string }
  url?: { iphone?: string | URL; ipad?: string | URL; googleplay?: string | URL }
  name?: string
}

export type Twitter = {
  card?: TwitterCard
  site?: string
  siteId?: string
  creator?: string
  creatorId?: string
  description?: string
  title?: string | TemplateString
  images?: OneOrMany<UrlLike | TwitterImage>
  players?: OneOrMany<TwitterPlayer>
  app?: TwitterApp
}

export type ResolvedTwitterImage = Omit<TwitterImage, 'url' | 'secureUrl'> & {
  url: string
  secureUrl?: string
}

export type ResolvedTwitter = {
  card: TwitterCard
  // True when no layer set `card`, so a later layer can infer it again from images.
  cardInferred?: boolean
  site?: string
  siteId?: string
  creator?: string
  creatorId?: string
  description?: string
  title?: string
  titleTemplate?: string | null
  images?: ResolvedTwitterImage[]
  players?: { playerUrl: string; streamUrl: string; width: number; height: number }[]
  app?: {
    id: TwitterApp['id']
    url?: { iphone?: string; ipad?: string; googleplay?: string }
    name?: string
  }
}

export type Icon = {
  url: string | URL
  type?: string
  sizes?: string
  rel?: string
  media?: string
  color?: string
  fetchPriority?: 'high' | 'low' | 'auto'
}

type IconInput = OneOrMany<UrlLike | Icon>

export type Icons = {
  icon?: IconInput
  apple?: IconInput
  shortcut?: IconInput
  other?: Icon | Icon[]
}

export type ResolvedIcon = Omit<Icon, 'url'> & { url: string }

export type ResolvedIcons = {
  icon?: ResolvedIcon[]
  apple?: ResolvedIcon[]
  shortcut?: ResolvedIcon[]
  other?: ResolvedIcon[]
}

export type AlternateLinkDescriptor = { url: string | URL; title?: string }

type AlternateValue = string | URL | AlternateLinkDescriptor[]

export type Alternates = {
  canonical?: string | URL | AlternateLinkDescriptor | null
  languages?: Record<string, AlternateValue>
  media?: Record<string, AlternateValue>
  types?: Record<string, AlternateValue>
}

export type ResolvedAlternateLink = { url: string; title?: string }

type ResolvedAlternateValue = string | ResolvedAlternateLink[]

export type ResolvedAlternates = {
  canonical: string | ResolvedAlternateLink | null
  languages?: Record<string, ResolvedAlternateValue>
  media?: Record<string, ResolvedAlternateValue>
  types?: Record<string, ResolvedAlternateValue>
}

export type Author = { name?: string; url?: string | URL }

export type Robots = RobotsDirective | string

type VerificationValue = string | number | (string | number)[]

export type Verification = {
  google?: VerificationValue
  yahoo?: VerificationValue
  yandex?: VerificationValue
  me?: VerificationValue
  other?: Record<string, VerificationValue>
}

export type Pagination = {
  previous?: string | URL | null
  next?: string | URL | null
}

export type ThemeColorDescriptor = { color: string; media?: string }

export type ColorScheme = 'normal' | 'light' | 'dark' | 'light dark' | 'dark light' | 'only light'

export type ViewportLayout = {
  width?: string | number
  height?: string | number
  initialScale?: number
  minimumScale?: number
  maximumScale?: number
  userScalable?: boolean
  viewportFit?: 'auto' | 'cover' | 'contain'
  interactiveWidget?: 'resizes-visual' | 'resizes-content' | 'overlays-content'
}

export type AppleImage = string | { url: string; media?: string }

export type AppleWebApp = {
  capable?: boolean
  title?: string
  startupImage?: AppleImage | AppleImage[]
  statusBarStyle?: 'default' | 'black' | 'black-translucent'
}

export type ResolvedAppleWebApp = {
  capable: boolean
  title: string | null
  startupImage: { url: string; media?: string }[] | null
  statusBarStyle: 'default' | 'black' | 'black-translucent'
}

export type FormatDetection = {
  telephone?: boolean
  date?: boolean
  address?: boolean
  email?: boolean
  url?: boolean
}

export type ItunesApp = { appId: string; appArgument?: string | URL }

export type AppLinksApple = { url: string | URL; app_store_id?: string | number; app_name?: string }
export type AppLinksAndroid = {
  package: string
  url?: string | URL
  class?: string
  app_name?: string
}
export type AppLinksWindows = { url: string | URL; app_id?: string; app_name?: string }
export type AppLinksWeb = { url: string | URL; should_fallback?: boolean }

export type AppLinks = {
  ios?: OneOrMany<AppLinksApple>
  iphone?: OneOrMany<AppLinksApple>
  ipad?: OneOrMany<AppLinksApple>
  android?: OneOrMany<AppLinksAndroid>
  windows_phone?: OneOrMany<AppLinksWindows>
  windows?: OneOrMany<AppLinksWindows>
  windows_universal?: OneOrMany<AppLinksWindows>
  web?: OneOrMany<AppLinksWeb>
}

export type ResolvedAppLinks = {
  [K in keyof AppLinks]?: Record<string, string | number | boolean | undefined>[]
}

export type Facebook = { appId?: string; admins?: string | string[] }

export type Pinterest = { richPin: string | boolean }

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
  icons?: UrlLike | Icon[] | Icons | null
  manifest?: string | URL | null
  openGraph?: OpenGraph | null
  twitter?: Twitter | null
  verification?: Verification
  category?: string | null
  classification?: string | null
  abstract?: string | null
  archives?: string | string[] | null
  assets?: string | string[] | null
  bookmarks?: string | string[] | null
  pagination?: Pagination | null
  viewport?: string | ViewportLayout | null
  themeColor?: string | ThemeColorDescriptor | ThemeColorDescriptor[] | null
  colorScheme?: ColorScheme | null
  appleWebApp?: boolean | AppleWebApp | null
  formatDetection?: FormatDetection | null
  itunes?: ItunesApp | null
  appLinks?: AppLinks | null
  facebook?: Facebook | null
  pinterest?: Pinterest | null
  other?: Record<string, string | number | (string | number)[]>
}

export interface ResolvedMetadata {
  metadataBase: URL | null
  title: string | null
  titleTemplate: string | null
  description: string | null
  applicationName: string | null
  authors: { name?: string; url?: string }[] | null
  generator: string | null
  keywords: string | string[] | null
  referrer: string | null
  creator: string | null
  publisher: string | null
  robots: string | null
  googleBot: string | null
  alternates: ResolvedAlternates | null
  icons: ResolvedIcons | null
  manifest: string | null
  openGraph: ResolvedOpenGraph | null
  twitter: ResolvedTwitter | null
  verification: Verification
  category: string | null
  classification: string | null
  abstract: string | null
  archives: string[] | null
  assets: string[] | null
  bookmarks: string[] | null
  pagination: { previous: string | null; next: string | null } | null
  viewport: string | null
  themeColor: ThemeColorDescriptor[] | null
  colorScheme: ColorScheme | null
  appleWebApp: ResolvedAppleWebApp | null
  formatDetection: FormatDetection | null
  itunes: { appId: string; appArgument?: string } | null
  appLinks: ResolvedAppLinks | null
  facebook: { appId?: string; admins?: string[] } | null
  pinterest: Pinterest | null
  other: Record<string, string | number | (string | number)[]>
}
