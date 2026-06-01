import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/_next/', '/admin/', '/api/'],
    },
    sitemap: 'https://rees52.com/sitemap.xml',
  }
}
