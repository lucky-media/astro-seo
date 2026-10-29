import type { Robots, RobotsInfo } from './types.ts'

const robotsKeys = [
  'noarchive',
  'nosnippet',
  'noimageindex',
  'nocache',
  'notranslate',
  'indexifembedded',
  'nositelinkssearchbox',
  'unavailable_after',
  'max-video-preview',
  'max-image-preview',
  'max-snippet',
] as const

export function resolveRobots(robots: Robots | null | undefined): string | null {
  if (robots == null) return null
  if (typeof robots === 'string') return robots
  return resolveRobotsInfo(robots)
}

export function resolveGoogleBot(robots: Robots | null | undefined): string | null {
  if (robots == null || typeof robots === 'string' || robots.googleBot == null) return null
  return resolveRobots(robots.googleBot)
}

function resolveRobotsInfo(robots: RobotsInfo): string {
  const values = [
    boolDirective(robots.index, 'index', 'noindex'),
    boolDirective(robots.follow, 'follow', 'nofollow'),
  ].filter((v): v is string => v !== null)

  for (const key of robotsKeys) {
    const value = robots[key]
    if (value === undefined || value === false) continue
    values.push(value === true ? key : `${key}:${value}`)
  }

  return values.join(', ')
}

function boolDirective(value: boolean | undefined, yes: string, no: string): string | null {
  if (value === true) return yes
  if (value === false) return no
  return null
}
