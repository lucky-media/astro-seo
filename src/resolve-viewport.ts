import type { Metadata, ThemeColorDescriptor, ViewportLayout } from './types.ts'
import { toArray } from './utils.ts'

const viewportKeys: [keyof ViewportLayout, string][] = [
  ['width', 'width'],
  ['height', 'height'],
  ['initialScale', 'initial-scale'],
  ['minimumScale', 'minimum-scale'],
  ['maximumScale', 'maximum-scale'],
  ['userScalable', 'user-scalable'],
  ['viewportFit', 'viewport-fit'],
  ['interactiveWidget', 'interactive-widget'],
]

export function resolveViewport(viewport: Metadata['viewport']): string | null {
  if (viewport == null) return null
  if (typeof viewport === 'string') return viewport

  const parts: string[] = []
  for (const [key, name] of viewportKeys) {
    const value = viewport[key]
    if (value == null) continue
    parts.push(`${name}=${typeof value === 'boolean' ? (value ? 'yes' : 'no') : value}`)
  }
  return parts.length > 0 ? parts.join(', ') : null
}

export function resolveThemeColor(
  themeColor: Metadata['themeColor']
): ThemeColorDescriptor[] | null {
  if (themeColor == null) return null
  return toArray(themeColor).map((value) => (typeof value === 'string' ? { color: value } : value))
}
