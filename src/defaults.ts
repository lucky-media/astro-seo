// src/defaults.ts
import type { ResolvedMetadata } from './types.ts'

export function createDefaultMetadata(): ResolvedMetadata {
  return {
    metadataBase: null,
    title: null,
    titleTemplate: null,
    description: null,
    applicationName: null,
    authors: null,
    generator: null,
    keywords: null,
    referrer: null,
    creator: null,
    publisher: null,
    robots: null,
    alternates: null,
    icons: null,
    manifest: null,
    openGraph: null,
    twitter: null,
    verification: {},
    category: null,
    classification: null,
    other: {},
  }
}
