import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const staticPages = [
    { url: `${baseUrl}/`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/testbed`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/regional`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/allocations`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/methodology`, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  return staticPages;
}
