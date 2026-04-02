# @lucky-media/astro-seo

Next.js App Router-style `generateMetadata` for Astro. Configure site-level SEO defaults once in `astro.config.mjs` and override per-page with a familiar API.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Setup: BaseLayout.astro](#setup-baselayoutastro)
5. [Pattern 1: Static Metadata](#pattern-1-static-metadata)
6. [Pattern 2: Dynamic Metadata](#pattern-2-dynamic-metadata)
7. [Pattern 3: Title Templates](#pattern-3-title-templates)
8. [Pattern 4: OpenGraph + Twitter](#pattern-4-opengraph--twitter)
9. [Pattern 5: Parent Inheritance](#pattern-5-parent-inheritance)
10. [Pattern 6: Robots + Canonical](#pattern-6-robots--canonical)
11. [Pattern 7: Icons](#pattern-7-icons)
12. [Pattern 8: CMS Defaults (SSG, fetch at build time)](#pattern-8-cms-defaults-ssg-fetch-at-build-time)
13. [Pattern 9: CMS Defaults (SSR, fetch at runtime)](#pattern-9-cms-defaults-ssr-fetch-at-runtime)
14. [Field Reference Table](#field-reference-table)
15. [Limitations](#limitations)

---

## Introduction

Managing `<head>` metadata in Astro has no built-in convention. Each site ends up reinventing its own props-drilling approach: a layout that accepts a `title` string, maybe a `description`, and then stops there. Adding OpenGraph images, Twitter cards, robots directives, canonical URLs, or per-page title templates requires custom plumbing every time.

`@lucky-media/astro-seo` solves this by bringing Next.js's `generateMetadata` / `Metadata` API to Astro. You get:

- **Site-level defaults** declared once in `astro.config.mjs` via the `defaultSeo()` integration
- **Per-page overrides** declared with `generateMetadata()`, using the same mental model as Next.js App Router
- **Automatic inheritance**: every page inherits site defaults; child values override parent values
- **Title templates**: `%s | My Site` applied to every page title automatically
- **Twitter card auto-detection**: `summary_large_image` when images are present, `summary` otherwise
- **A typed `<SEO />` component** that renders every supported `<meta>` and `<link>` tag

If you know Next.js metadata, you already know this API.

---

## Installation

```bash
npm install @lucky-media/astro-seo
```

Then add the integration to `astro.config.mjs`:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { defaultSeo } from '@lucky-media/astro-seo'

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    defaultSeo({
      metadataBase: new URL('https://example.com'),
      title: { default: 'My Site', template: '%s | My Site' },
      description: 'My site description',
    }),
  ],
})
```

### TypeScript / IDE completions

TypeScript types for `virtual:@lucky-media/astro-seo` are injected automatically by the integration into `.astro/integrations/@lucky-media/astro-seo/types.d.ts`. No `tsconfig.json` changes or `/// <reference>` directives are needed; you get full IntelliSense for `generateMetadata`, `resolveMetadata`, `Metadata`, and `ResolvedMetadata` out of the box.

---

## Configuration

`defaultSeo(config)` accepts either a full `Metadata` object or a function that returns one (sync or async). All fields are optional.

**Static config**: serialized and embedded in the virtual module at build time. No runtime overhead:

```js
defaultSeo({
  title: { default: 'My Site', template: '%s | My Site' },
  description: 'My site description',
})
```

**Function config**: called once during Vite's build, before the virtual module is compiled. Use this to fetch defaults from a CMS or environment at build time:

```js
defaultSeo(async () => {
  const res = await fetch('https://your-cms.com/api/seo-defaults')
  return res.json()
})
```

Sync functions are also accepted (`() => ({ title: '...' })`). The result is cached; the function is never called more than once per build.

For per-request runtime defaults (SSR), see [Pattern 9](#pattern-9-cms-defaults-ssr--fetch-at-runtime).

---

The full static config reference:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { defaultSeo } from '@lucky-media/astro-seo'

export default defineConfig({
  integrations: [
    defaultSeo({
      // Base URL used to resolve relative paths for images, icons, and URLs
      metadataBase: new URL('https://example.com'),

      // Plain string: every page gets exactly this title (no template applied)
      // TemplateString: sets a site default AND a template for per-page titles
      title: { default: 'My Site', template: '%s | My Site' },

      description: 'We build great digital products.',

      applicationName: 'My Site',
      generator: 'Astro',
      keywords: ['astro', 'seo', 'metadata'],
      referrer: 'origin-when-cross-origin',
      creator: 'Lucky Media',
      publisher: 'Lucky Media',

      // Robots: string or directive object
      robots: 'index, follow',

      // Canonical and alternate language URLs
      alternates: {
        canonical: 'https://example.com',
        languages: { 'en-US': 'https://example.com/en-us' },
      },

      // Favicon, Apple touch icon, shortcut icon
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
        shortcut: '/shortcut-icon.png',
      },

      // Web app manifest
      manifest: '/site.webmanifest',

      // OpenGraph defaults (used on every page unless overridden)
      openGraph: {
        type: 'website',
        siteName: 'My Site',
        locale: 'en_US',
        images: [{ url: '/og-default.png', alt: 'My Site' }],
      },

      // Twitter card defaults
      twitter: {
        site: '@mysite',
        creator: '@myhandle',
      },

      // Site verification tokens
      verification: {
        google: 'abc123',
        yandex: 'def456',
      },

      // Arbitrary extra meta tags
      other: {
        'theme-color': '#ffffff',
      },
    }),
  ],
})
```

---

## Setup: BaseLayout.astro

Every page in your site should render through a shared layout. The layout is where `resolveMetadata()` merges the site config with the page's overrides, and where the `<SEO />` component renders the resulting `<head>` tags.

```astro
---
// src/layouts/BaseLayout.astro
import { resolveMetadata } from 'virtual:@lucky-media/astro-seo'
import SEO from '@lucky-media/astro-seo/SEO.astro'
import type { Metadata } from 'virtual:@lucky-media/astro-seo'

interface Props {
  metadata?: Metadata
}

const resolved = resolveMetadata(Astro.props.metadata)
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <SEO metadata={resolved} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

**How it works:**

- `resolveMetadata(pageMetadata?)` reads the site config baked in by the integration and merges the page's overrides on top
- `<SEO metadata={resolved} />` renders every applicable `<meta>` and `<link>` tag from the resolved metadata
- If no `metadata` prop is passed, `resolveMetadata()` still returns the full site defaults

---

## Pattern 1: Static Metadata

For pages with fixed, known content, call `generateMetadata()` with literal values.

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro'
import { generateMetadata } from 'virtual:@lucky-media/astro-seo'

const metadata = generateMetadata({
  title: 'Home',
  description: 'Welcome to Lucky Media.',
})
---
<BaseLayout metadata={metadata}>
  <h1>Welcome</h1>
</BaseLayout>
```

With the title template `'%s | My Site'` configured at the site level, the page title resolves to `"Home | My Site"`. Unset fields fall through to the site config.

---

## Pattern 2: Dynamic Metadata

For dynamic pages (blog posts, product pages, user profiles), fetch data in the frontmatter and pass it to `generateMetadata()`.

```astro
---
// src/pages/blog/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro'
import { generateMetadata } from 'virtual:@lucky-media/astro-seo'

export function getStaticPaths() {
  return [
    { params: { slug: 'hello-world' }, props: { title: 'Hello World', excerpt: 'First post.' } },
    { params: { slug: 'design-tips' }, props: { title: 'Design Tips', excerpt: 'Top 10 tips.' } },
  ]
}

const { title, excerpt } = Astro.props

const metadata = generateMetadata({
  title,
  description: excerpt,
  openGraph: {
    type: 'article',
    title,
    description: excerpt,
    images: [{ url: `/og/blog/${Astro.params.slug}.png`, alt: title }],
  },
  twitter: {
    title,
    description: excerpt,
    images: [{ url: `/og/blog/${Astro.params.slug}.png`, alt: title }],
  },
})
---
<BaseLayout metadata={metadata}>
  <article>
    <h1>{title}</h1>
    <p>{excerpt}</p>
  </article>
</BaseLayout>
```

In SSR mode (`output: 'server'`), use `await` in the frontmatter before calling `generateMetadata()`:

```astro
---
const { slug } = Astro.params
const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json())

const metadata = generateMetadata({
  title: post.title,
  description: post.excerpt,
})
---
```

---

## Pattern 3: Title Templates

Title templates let you define a site-wide title suffix once and have every page title formatted automatically.

### Site-level template

```js
defaultSeo({
  title: { default: 'Lucky Media', template: '%s | Lucky Media' },
})
```

- `default`: used when a page provides no title at all
- `template`: applied to every page title that passes a plain string or `TemplateString.default`

### Per-page title with template applied

```astro
const metadata = generateMetadata({ title: 'About' })
// Resolves to: "About | Lucky Media"
```

### Bypassing the template with `absolute`

```astro
const metadata = generateMetadata({
  title: { absolute: 'Lucky Media - Special Campaign' },
})
// Resolves to: "Lucky Media - Special Campaign"
```

### Overriding the template for a subtree

```astro
const metadata = generateMetadata({
  title: { default: 'Blog', template: '%s - Lucky Media Blog' },
})
// This page: "Blog"
// Child pages using this layout: "Post Title - Lucky Media Blog"
```

---

## Pattern 4: OpenGraph + Twitter

Both `openGraph` and `twitter` are **deep-merged field-by-field** with the site defaults. Fields you set on a page override the corresponding site default; fields you omit are inherited. To clear a field entirely, set it to `null`.

### OpenGraph

```astro
const metadata = generateMetadata({
  title: 'Our Services',
  openGraph: {
    type: 'website',
    title: 'Our Services - Lucky Media',
    description: 'Full-service digital studio.',
    siteName: 'Lucky Media',
    locale: 'en_US',
    url: 'https://example.com/services',
    images: [
      {
        url: '/og/services.png',
        alt: 'Lucky Media Services',
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
})
```

HTML output:

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Our Services - Lucky Media" />
<meta property="og:description" content="Full-service digital studio." />
<meta property="og:site_name" content="Lucky Media" />
<meta property="og:locale" content="en_US" />
<meta property="og:url" content="https://example.com/services" />
<meta property="og:image" content="https://example.com/og/services.png" />
<meta property="og:image:alt" content="Lucky Media Services" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
```

### Twitter

```astro
const metadata = generateMetadata({
  title: 'Our Services',
  twitter: {
    card: 'summary_large_image',
    site: '@luckymedia',
    creator: '@luckymedia',
    title: 'Our Services - Lucky Media',
    description: 'Full-service digital studio.',
    images: [{ url: '/og/services.png', alt: 'Lucky Media Services' }],
  },
})
```

### Twitter card auto-detection

You do not need to set `card` explicitly. The resolver infers it:

| Condition | Resolved `twitter:card` |
|---|---|
| `twitter.images` is set | `summary_large_image` |
| `twitter.images` is not set | `summary` |

To use `player` or `app`, set `card` explicitly.

---

## Pattern 5: Parent Inheritance

Because `openGraph` and `twitter` are deep-merged, you only need to set the fields that differ from your site defaults. The rest are inherited automatically.

```astro
---
// src/pages/products/[id].astro
import BaseLayout from '../../layouts/BaseLayout.astro'
import { generateMetadata } from 'virtual:@lucky-media/astro-seo'

export function getStaticPaths() {
  return [
    { params: { id: '1' }, props: { name: 'Widget Pro', image: '/products/widget-pro.png' } },
    { params: { id: '2' }, props: { name: 'Super Gadget', image: '/products/gadget.png' } },
  ]
}

const { name, image } = Astro.props

const metadata = generateMetadata({
  title: name,
  openGraph: {
    title: name,
    images: [{ url: image, alt: name }], // site default image inherited when omitted
  },
})
---
<BaseLayout metadata={metadata}>
  <h1>{name}</h1>
</BaseLayout>
```

If you need to read the site-level resolved metadata directly (for example to combine values), `resolveMetadata()` called with no arguments returns it:

### Inheritance rules

| Field | Child behaviour |
|---|---|
| `title` | Overrides parent; parent template still applied unless `absolute` used |
| `description` | Replaces parent value when set |
| `openGraph` | Deep-merged field-by-field; `images` replaced when set, inherited when omitted |
| `twitter` | Deep-merged field-by-field; `images` replaced when set, inherited when omitted |
| `verification` | Shallow-merged: child keys extend parent keys |
| `other` | Shallow-merged: child keys extend parent keys |
| All other fields | Child value replaces parent when not `undefined` |

---

## Pattern 6: Robots + Canonical

### Robots

**String form:**

```astro
const metadata = generateMetadata({
  robots: 'noindex, nofollow',
})
```

**Object form:**

```astro
const metadata = generateMetadata({
  robots: { index: false, follow: false },
  // serializes to "noindex, nofollow"
})

const metadata = generateMetadata({
  robots: { index: true, follow: true, nocache: true },
  // serializes to "index, follow, nocache"
})
```

### Canonical URL

```astro
const metadata = generateMetadata({
  title: 'About',
  alternates: {
    canonical: 'https://example.com/about',
  },
})
```

Relative paths are resolved against `metadataBase`:

```astro
const metadata = generateMetadata({
  alternates: {
    canonical: '/about', // resolves to https://example.com/about
  },
})
```

### Alternate language links (hreflang)

```astro
const metadata = generateMetadata({
  alternates: {
    canonical: 'https://example.com/about',
    languages: {
      'en-US': 'https://example.com/en-us/about',
      'fr-FR': 'https://fr.example.com/about',
    },
  },
})
```

```html
<link rel="canonical" href="https://example.com/about" />
<link rel="alternate" hreflang="en-US" href="https://example.com/en-us/about" />
<link rel="alternate" hreflang="fr-FR" href="https://fr.example.com/about" />
```

---

## Pattern 7: Icons

### Simple string paths

```js
defaultSeo({
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/shortcut-icon.png',
  },
})
```

```html
<link rel="icon" href="https://example.com/favicon.ico" />
<link rel="apple-touch-icon" href="https://example.com/apple-touch-icon.png" />
<link rel="shortcut icon" href="https://example.com/shortcut-icon.png" />
```

### Multiple icons with explicit sizes and MIME types

```js
defaultSeo({
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
    ],
  },
})
```

### Web app manifest

```js
defaultSeo({
  manifest: '/site.webmanifest',
})
```

```html
<link rel="manifest" href="https://example.com/site.webmanifest" />
```

---

## Pattern 8: CMS Defaults (SSG, fetch at build time)

When your site-wide SEO defaults live in a CMS (title, description, OG image, etc.), pass an async function to `defaultSeo()`. It is called once during the build and the result is baked into the virtual module, exactly like a static config, just fetched dynamically.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { defaultSeo } from '@lucky-media/astro-seo'

export default defineConfig({
  integrations: [
    defaultSeo(async () => {
      const res = await fetch('https://your-cms.com/api/seo-defaults')
      const data = await res.json()

      return {
        metadataBase: new URL('https://example.com'),
        title: { default: data.siteName, template: `%s | ${data.siteName}` },
        description: data.description,
        openGraph: {
          siteName: data.siteName,
          images: [{ url: data.defaultOgImage, alt: data.siteName }],
        },
      }
    }),
  ],
})
```

The async function is resolved **once** during Vite's build phase, before the virtual module is compiled. No CMS calls happen at request time; the resolved config is static for the lifetime of the build.

---

## Pattern 9: CMS Defaults (SSR, fetch at runtime)

For SSR sites where site-wide defaults change between requests (multi-tenant apps, preview modes, A/B testing), pass runtime defaults as the second argument to `resolveMetadata()`. These are merged between the baked-in site config and page-level metadata.

**Merge order:**

```
null baseline → baked-in site config → runtime defaults → page metadata
```

Runtime defaults override the baked-in config; page metadata still wins over everything.

```astro
---
// src/layouts/BaseLayout.astro
import { resolveMetadata } from 'virtual:@lucky-media/astro-seo'
import SEO from '@lucky-media/astro-seo/SEO.astro'
import type { Metadata } from 'virtual:@lucky-media/astro-seo'

interface Props {
  metadata?: Metadata
}

// Fetch CMS defaults per-request; cache this however suits your app
const res = await fetch(`https://your-cms.com/api/seo-defaults?site=${Astro.locals.siteId}`)
const cmsDefaults: Metadata = await res.json()

const resolved = resolveMetadata(Astro.props.metadata, cmsDefaults)
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <SEO metadata={resolved} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`resolveMetadata()` stays synchronous; the async work (the CMS fetch) happens in the Astro frontmatter before `resolveMetadata` is called. You control caching strategy: store defaults in `Astro.locals`, a module-level Map keyed by tenant, or any other pattern.

For SSG builds where defaults never change at runtime, use [Pattern 8](#pattern-8-cms-defaults-ssg--fetch-at-build-time) instead.

---

## Field Reference Table

### Core fields

| Field | Example | HTML output |
|---|---|---|
| `title` (string) | `title: 'Page Title'` | `<title>Page Title</title>` |
| `title.default` | `title: { default: 'Site' }` | `<title>Site</title>` |
| `title.template` | `title: { template: '%s \| Site' }` | Applied to child page titles |
| `title.absolute` | `title: { absolute: 'Fixed Title' }` | `<title>Fixed Title</title>` (bypasses template) |
| `description` | `description: 'Page description'` | `<meta name="description" content="..." />` |
| `applicationName` | `applicationName: 'My App'` | `<meta name="application-name" content="..." />` |
| `authors` | `authors: [{ name: 'Jane', url: 'https://...' }]` | `<meta name="author" content="Jane" />` |
| `generator` | `generator: 'Astro'` | `<meta name="generator" content="Astro" />` |
| `keywords` | `keywords: ['astro', 'seo']` | `<meta name="keywords" content="astro, seo" />` |
| `referrer` | `referrer: 'origin-when-cross-origin'` | `<meta name="referrer" content="..." />` |
| `creator` | `creator: 'Lucky Media'` | `<meta name="author" content="Lucky Media" />` |
| `publisher` | `publisher: 'Lucky Media'` | `<meta name="publisher" content="Lucky Media" />` |
| `category` | `category: 'technology'` | `<meta name="category" content="technology" />` |
| `metadataBase` | `metadataBase: new URL('https://example.com')` | Used to resolve relative URLs |

### Robots

| Field | Example | HTML output |
|---|---|---|
| `robots` (string) | `robots: 'noindex, nofollow'` | `<meta name="robots" content="noindex, nofollow" />` |
| `robots.index` | `robots: { index: true }` | `<meta name="robots" content="index" />` |
| `robots.follow` | `robots: { follow: false }` | `<meta name="robots" content="nofollow" />` |
| `robots.nocache` | `robots: { nocache: true }` | `<meta name="robots" content="nocache" />` |

### Alternates

| Field | Example | HTML output |
|---|---|---|
| `alternates.canonical` | `alternates: { canonical: '/page' }` | `<link rel="canonical" href="..." />` |
| `alternates.languages` | `alternates: { languages: { 'en-US': '/en' } }` | `<link rel="alternate" hreflang="en-US" href="/en" />` |

### Icons

| Field | Example | HTML output |
|---|---|---|
| `icons.icon` (string) | `icons: { icon: '/favicon.ico' }` | `<link rel="icon" href="..." />` |
| `icons.icon` (object) | `icons: { icon: { url: '/favicon.png', sizes: '32x32', type: 'image/png' } }` | `<link rel="icon" href="..." type="image/png" sizes="32x32" />` |
| `icons.apple` | `icons: { apple: '/apple-touch-icon.png' }` | `<link rel="apple-touch-icon" href="..." />` |
| `icons.shortcut` | `icons: { shortcut: '/shortcut.ico' }` | `<link rel="shortcut icon" href="..." />` |
| `manifest` | `manifest: '/site.webmanifest'` | `<link rel="manifest" href="..." />` |

### OpenGraph

| Field | Example | HTML output |
|---|---|---|
| `openGraph.type` | `openGraph: { type: 'article' }` | `<meta property="og:type" content="article" />` |
| `openGraph.title` | `openGraph: { title: 'Title' }` | `<meta property="og:title" content="Title" />` |
| `openGraph.description` | `openGraph: { description: '...' }` | `<meta property="og:description" content="..." />` |
| `openGraph.url` | `openGraph: { url: 'https://...' }` | `<meta property="og:url" content="..." />` |
| `openGraph.siteName` | `openGraph: { siteName: 'My Site' }` | `<meta property="og:site_name" content="My Site" />` |
| `openGraph.locale` | `openGraph: { locale: 'en_US' }` | `<meta property="og:locale" content="en_US" />` |
| `openGraph.images[].url` | `openGraph: { images: [{ url: '/og.png' }] }` | `<meta property="og:image" content="..." />` |
| `openGraph.images[].alt` | `openGraph: { images: [{ url: '...', alt: 'Alt' }] }` | `<meta property="og:image:alt" content="Alt" />` |
| `openGraph.images[].width` | `openGraph: { images: [{ url: '...', width: 1200 }] }` | `<meta property="og:image:width" content="1200" />` |
| `openGraph.images[].height` | `openGraph: { images: [{ url: '...', height: 630 }] }` | `<meta property="og:image:height" content="630" />` |
| `openGraph.images[].type` | `openGraph: { images: [{ url: '...', type: 'image/png' }] }` | `<meta property="og:image:type" content="image/png" />` |

### Twitter

| Field | Example | HTML output |
|---|---|---|
| `twitter.card` | `twitter: { card: 'summary_large_image' }` | `<meta name="twitter:card" content="summary_large_image" />` |
| `twitter.site` | `twitter: { site: '@mysite' }` | `<meta name="twitter:site" content="@mysite" />` |
| `twitter.creator` | `twitter: { creator: '@handle' }` | `<meta name="twitter:creator" content="@handle" />` |
| `twitter.title` | `twitter: { title: 'Title' }` | `<meta name="twitter:title" content="Title" />` |
| `twitter.description` | `twitter: { description: '...' }` | `<meta name="twitter:description" content="..." />` |
| `twitter.images[].url` | `twitter: { images: [{ url: '/og.png' }] }` | `<meta name="twitter:image" content="..." />` |
| `twitter.images[].alt` | `twitter: { images: [{ url: '...', alt: 'Alt' }] }` | `<meta name="twitter:image:alt" content="Alt" />` |

### Verification

| Field | Example | HTML output |
|---|---|---|
| `verification.google` | `verification: { google: 'abc123' }` | `<meta name="google-site-verification" content="abc123" />` |
| `verification.yandex` | `verification: { yandex: 'def456' }` | `<meta name="yandex-verification" content="def456" />` |

### Other / custom meta tags

| Field | Example | HTML output |
|---|---|---|
| `other` | `other: { 'theme-color': '#fff' }` | `<meta name="theme-color" content="#fff" />` |
| `other` (array) | `other: { 'theme-color': ['#fff', '#000'] }` | Multiple `<meta name="theme-color" .../>` tags |

---

## Limitations

### File-based static OG images

`@lucky-media/astro-seo` does not generate OG images. Image paths must point to files that already exist in your `public/` directory or are generated by a separate tool. Relative paths are resolved against `metadataBase` so the final `<meta>` tag contains an absolute URL.

### No streaming or PPR support

`resolveMetadata()` is a synchronous function. All metadata, including any runtime CMS defaults, must be resolved in the Astro frontmatter before the component renders. Use `await` in the frontmatter before calling `resolveMetadata()` or `generateMetadata()`.

### No `robots.googleBot` rendering

The `RobotsDirective` type includes a `googleBot` nested directive (mirroring Next.js), but the `<SEO />` component currently renders only the top-level `<meta name="robots">` tag.

### Unrendered fields

`verification.yahoo`, `twitter.siteId`, and `twitter.creatorId` are accepted by the `Metadata` type but are not currently rendered by the `<SEO />` component. They are available in the resolved metadata object if you need to render them manually.
