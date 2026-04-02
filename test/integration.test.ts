import { describe, it, expect, vi } from 'vitest'
import { defaultSeo } from '../src/integration.ts'

async function getVirtualModuleCode(config: Parameters<typeof defaultSeo>[0]): Promise<string> {
  const integration = defaultSeo(config)
  const setupHook = integration.hooks['astro:config:setup']

  let loadFn: ((id: string) => unknown) | undefined
  ;(setupHook as Function)({
    updateConfig: vi.fn<() => void>(({ vite }: any) => {
      loadFn = vite.plugins[0].load
    }),
  })

  const resolvedId = '\0virtual:@lucky-media/astro-seo'
  return (await loadFn!(resolvedId)) as string
}

describe('defaultSeo integration', () => {
  it('calls injectTypes with virtual module declaration in astro:config:done', () => {
    const integration = defaultSeo({})
    const hook = integration.hooks['astro:config:done']

    expect(hook).toBeDefined()

    const injectTypes = vi.fn<() => void>()
    ;(hook as Function)({ injectTypes })

    expect(injectTypes).toHaveBeenCalledOnce()

    const [arg] = injectTypes.mock.calls[0]
    expect(arg.filename).toMatch(/\.d\.ts$/)
    expect(arg.content).toContain("declare module 'virtual:@lucky-media/astro-seo'")
    expect(arg.content).toContain('generateMetadata')
    expect(arg.content).toContain('resolveMetadata')
  })
})

describe('defaultSeo with function config', () => {
  it('accepts a sync function and bakes the result into the virtual module', async () => {
    const code = await getVirtualModuleCode(() => ({ description: 'CMS Default' }))
    expect(code).toContain('CMS Default')
  })

  it('accepts an async function and awaits its result', async () => {
    const code = await getVirtualModuleCode(async () => {
      await Promise.resolve()
      return { description: 'Async CMS Default' }
    })
    expect(code).toContain('Async CMS Default')
  })

  it('calls the loader function only once across multiple load calls', async () => {
    let callCount = 0
    const integration = defaultSeo(async () => {
      callCount++
      return { description: 'Fetched Once' }
    })
    const setupHook = integration.hooks['astro:config:setup']

    let loadFn: ((id: string) => unknown) | undefined
    ;(setupHook as Function)({
      updateConfig: vi.fn<() => void>(({ vite }: any) => {
        loadFn = vite.plugins[0].load
      }),
    })

    const resolvedId = '\0virtual:@lucky-media/astro-seo'
    await loadFn!(resolvedId)
    await loadFn!(resolvedId)

    expect(callCount).toBe(1)
  })
})

describe('resolveMetadata with runtime defaults', () => {
  it('generated module code includes runtimeDefaults parameter', async () => {
    const code = await getVirtualModuleCode({ description: 'Site desc' })
    expect(code).toContain('runtimeDefaults')
  })

  it('type declaration includes runtimeDefaults parameter in resolveMetadata', () => {
    const integration = defaultSeo({})
    const hook = integration.hooks['astro:config:done']

    const injectTypes = vi.fn<() => void>()
    ;(hook as Function)({ injectTypes })

    const [arg] = injectTypes.mock.calls[0]
    expect(arg.content).toContain('runtimeDefaults')
  })
})
