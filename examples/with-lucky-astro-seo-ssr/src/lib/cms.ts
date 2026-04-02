// Mock CMS — replace with real API calls (fetch, SDK, etc.)
// getSeoDefaults() simulates a request to a headless CMS for site-wide SEO settings.
// In a real app this would be a fetch() call, a GraphQL query, or an SDK call.

export type SeoDefaults = {
  siteName: string
  title: string
  description: string
  ogImage: string
  twitterHandle: string
}

export type Post = {
  slug: string
  title: string
  excerpt: string
  content: string
}

export type Product = {
  id: string
  name: string
  description: string
  image: string
}

// In production this data comes from your CMS API.
const mockSeoDefaults: SeoDefaults = {
  siteName: 'Acme Corp',
  title: 'Acme Corp',
  description: 'We make things that make things.',
  ogImage: '/og-default.png',
  twitterHandle: '@acmecorp',
}

const mockPosts: Post[] = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'Our very first blog post.',
    content: 'Welcome to the Acme blog. We are just getting started.',
  },
  {
    slug: 'new-product-launch',
    title: 'New Product Launch',
    excerpt: 'Introducing Widget Pro 2.',
    content: 'We are thrilled to announce Widget Pro 2, the best widget yet.',
  },
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Widget Pro',
    description: 'The original, the best. Used by thousands of teams.',
    image: '/products/widget-pro.png',
  },
  {
    id: '2',
    name: 'Super Gadget',
    description: 'A gadget unlike any other. Solves problems you did not know you had.',
    image: '/products/gadget.png',
  },
]

export async function getSeoDefaults(): Promise<SeoDefaults> {
  // Replace with: const res = await fetch('https://cms.example.com/api/seo-defaults')
  //               return res.json()
  return mockSeoDefaults
}

export async function getPost(slug: string): Promise<Post | null> {
  return mockPosts.find((p) => p.slug === slug) ?? null
}

export async function getProduct(id: string): Promise<Product | null> {
  return mockProducts.find((p) => p.id === id) ?? null
}
