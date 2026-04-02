import type { Robots } from './types.ts'

export function resolveRobots(robots: Robots | null | undefined): string | null {
  if (robots == null) return null
  if (typeof robots === 'string') return robots

  return [
    boolDirective(robots.index, 'index', 'noindex'),
    boolDirective(robots.follow, 'follow', 'nofollow'),
    robots.nocache ? 'nocache' : null,
  ]
    .filter((v): v is string => v !== null)
    .join(', ')
}

function boolDirective(value: boolean | undefined, yes: string, no: string): string | null {
  if (value === true) return yes
  if (value === false) return no
  return null
}
