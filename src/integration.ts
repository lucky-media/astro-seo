import type { AstroIntegration, HookParameters } from 'astro'
import type { Metadata } from './types.ts'

const VIRTUAL_MODULE_TYPES = `declare module 'virtual:@lucky-media/astro-seo' {
  import type { Metadata, ResolvedMetadata } from '@lucky-media/astro-seo'
  export function generateMetadata(overrides: Metadata): Metadata
  export function resolveMetadata(pageMetadata?: Metadata, runtimeDefaults?: Metadata): ResolvedMetadata
  export type { Metadata, ResolvedMetadata }
}`

type SiteConfig = Metadata | (() => Metadata | Promise<Metadata>)

function serializeConfig(config: Metadata): string {
  return JSON.stringify(config, (_, value) => {
    if (value instanceof URL) return value.href
    return value
  })
}

export function defaultSeo(siteConfig: SiteConfig): AstroIntegration {
  return {
    name: '@lucky-media/astro-seo',
    hooks: {
      'astro:config:done': ({ injectTypes }: HookParameters<'astro:config:done'>) => {
        injectTypes({ filename: 'types.d.ts', content: VIRTUAL_MODULE_TYPES })
      },
      'astro:config:setup': ({ updateConfig }: HookParameters<'astro:config:setup'>) => {
        const virtualModuleId = 'virtual:@lucky-media/astro-seo'
        const resolvedId = '\0' + virtualModuleId

        // Cache the resolved module code so the loader function is called only once.
        let cachedModuleCode: string | null = null

        updateConfig({
          vite: {
            plugins: [
              {
                name: '@lucky-media/astro-seo-virtual',
                resolveId(id: string) {
                  if (id === virtualModuleId) return resolvedId
                },
                async load(id: string) {
                  if (id !== resolvedId) return

                  if (!cachedModuleCode) {
                    const config =
                      typeof siteConfig === 'function' ? await siteConfig() : siteConfig
                    const serialized = serializeConfig(config)

                    cachedModuleCode = `
import { createDefaultMetadata } from '@lucky-media/astro-seo/internal/defaults'
import { mergeMetadata } from '@lucky-media/astro-seo/internal/merge'

const siteConfig = ${serialized}

export function generateMetadata(overrides) {
  return overrides
}

export function resolveMetadata(pageMetadata, runtimeDefaults) {
  const base = mergeMetadata(createDefaultMetadata(), siteConfig)
  const withRuntime = runtimeDefaults ? mergeMetadata(base, runtimeDefaults) : base
  return pageMetadata ? mergeMetadata(withRuntime, pageMetadata) : withRuntime
}
`
                  }

                  return cachedModuleCode
                },
              },
            ],
          },
        })
      },
    },
  }
}
