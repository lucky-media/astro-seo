import { defineConfig } from 'astro/config'
import { defaultSeo } from '@lucky-media/astro-seo'

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    defaultSeo({
      metadataBase: new URL('https://example.com'),
      title: { default: 'Lucky Media', template: '%s | Lucky Media' },
      description: 'We build great digital products.',
      icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
      openGraph: {
        siteName: 'Lucky Media',
        images: [{ url: '/og-default.png', alt: 'Lucky Media' }],
      },
      twitter: { site: '@luckymedia' },
    }),
  ],
})
