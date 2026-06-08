import { MetadataRoute } from 'next'
import { getVideos, getEbooks } from '@/app/actions/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rees52.tech"
  
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/login",
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === "" ? 1 : 0.8,
  }))

  try {
    const [videos, ebooks] = await Promise.all([
      getVideos(),
      getEbooks()
    ])

    videos.forEach((v) => {
      sitemapEntries.push({
        url: `${baseUrl}/videos/${v.id}`,
        lastModified: v.created_at ? new Date(v.created_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    })

    ebooks.forEach((e) => {
      sitemapEntries.push({
        url: `${baseUrl}/ebooks/${e.id}`,
        lastModified: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    })
  } catch (err) {
    console.error("Failed to generate dynamic sitemap entries:", err)
  }

  return sitemapEntries
}
