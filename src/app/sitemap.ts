import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rees52.com"
  
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/login",
  ]
  
  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === "" ? 1 : 0.8,
  }))
}
