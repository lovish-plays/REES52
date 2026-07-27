import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'REES52 Learning Hub',
    short_name: 'REES52 Learning',
    description: 'Premium robotics, embedded systems, and STEM learning portal by REES52.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0E12',
    theme_color: '#0D0E12',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}
