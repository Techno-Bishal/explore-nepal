import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const destinations = await prisma.destination.findMany({ select: { slug: true, updatedAt: true } });
  const destUrls = (destinations ?? []).map((d: any) => ({
    url: `${baseUrl}/destinations/${d?.slug ?? ''}`,
    lastModified: d?.updatedAt ?? new Date(),
  }));
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/destinations`, lastModified: new Date() },
    ...destUrls,
  ];
}
