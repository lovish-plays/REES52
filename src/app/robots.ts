import { MetadataRoute } from 'next'
import { absoluteUrl, siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/_next/',
        '/admin/',
        '/api/',
        '/dashboard/',
        '/my-learning',
        '/my-stuff',
        '/onboarding',
        '/login',
        '/certificate/',
        '/auth/',
      ],
    },
    host: siteConfig.url,
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
