import { describe, it, expect } from 'vitest'
import { resolveTitle, extractTitleTemplate } from '../src/resolve-title.ts'

describe('resolveTitle', () => {
  it('returns string title unchanged when no template', () => {
    expect(resolveTitle('My Page', null)).toBe('My Page')
  })
  it('applies parent template to string title', () => {
    expect(resolveTitle('Settings', '%s | My App')).toBe('Settings | My App')
  })
  it('absolute overrides parent template', () => {
    expect(resolveTitle({ absolute: 'Override' }, '%s | My App')).toBe('Override')
  })
  it('uses default from TemplateString when no template', () => {
    expect(resolveTitle({ default: 'Fallback' }, null)).toBe('Fallback')
  })
  it('returns null for null input', () => {
    expect(resolveTitle(null, null)).toBeNull()
  })
})

describe('extractTitleTemplate', () => {
  it('extracts template from TemplateString', () => {
    expect(extractTitleTemplate({ default: 'Home', template: '%s | Site' })).toBe('%s | Site')
  })
  it('returns null for string title', () => {
    expect(extractTitleTemplate('Home')).toBeNull()
  })
  it('returns null when no template key', () => {
    expect(extractTitleTemplate({ default: 'Home' })).toBeNull()
  })
})
