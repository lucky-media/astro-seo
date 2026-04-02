import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { defaultSeo } from '@lucky-media/astro-seo'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    // Minimal build-time fallbacks — real site-wide defaults are fetched from
    // the CMS on every request inside BaseLayout.astro via the runtimeDefaults
    // argument of resolveMetadata(). Swap this for an async function if you
    // want CMS defaults baked in at build time instead (SSG style):
    //
    //   defaultSeo(async () => {
    //     const res = await fetch('https://cms.example.com/api/seo')
    //     return res.json()
    //   })
    defaultSeo({
      metadataBase: new URL('https://example.com'),
    }),
  ],
})
