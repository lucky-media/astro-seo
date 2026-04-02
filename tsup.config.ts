import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/defaults.ts',
    'src/merge.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['astro'],
})
