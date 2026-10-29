import type { TemplateString } from './types.ts'

export function resolveTitle(
  title: string | TemplateString | null | undefined,
  parentTemplate: string | null
): string | null {
  if (title == null) return null
  if (typeof title === 'string') {
    return applyTemplate(parentTemplate, title)
  }
  if ('absolute' in title && title.absolute != null) return title.absolute
  const value = title.default ?? null
  if (value == null) return null
  return applyTemplate(parentTemplate, value)
}

export function extractTitleTemplate(
  title: string | TemplateString | null | undefined
): string | null {
  if (title == null || typeof title === 'string') return null

  return title.template ?? null
}

function applyTemplate(template: string | null, title: string): string {
  return template ? template.replace(/%s/g, title) : title
}
