import type { TemplateString } from './types.ts'

export function resolveTitle(
  title: string | TemplateString | null | undefined,
  parentTemplate: string | null
): string | null {
  if (title == null) return null
  if (typeof title === 'string') {
    return parentTemplate ? parentTemplate.replace('%s', title) : title
  }
  if ('absolute' in title && title.absolute != null) return title.absolute
  const value = title.default ?? null
  if (value == null) return null
  return parentTemplate ? parentTemplate.replace('%s', value) : value
}

export function extractTitleTemplate(
  title: string | TemplateString | null | undefined
): string | null {
  if (title == null || typeof title === 'string') return null

  return title.template ?? null
}
