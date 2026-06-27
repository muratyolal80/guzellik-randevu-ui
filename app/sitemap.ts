import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFreq: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1.0, changeFreq: 'daily' },
  { path: '/search', priority: 0.9, changeFreq: 'daily' },
  { path: '/login', priority: 0.5, changeFreq: 'monthly' },
  { path: '/register', priority: 0.6, changeFreq: 'monthly' },
  { path: '/register/business', priority: 0.7, changeFreq: 'monthly' },
  { path: '/kvkk', priority: 0.3, changeFreq: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kuaforara.com.tr').replace(/\/+$/, '');
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  let salonEntries: MetadataRoute.Sitemap = [];

  try {
    const { data: salons } = await supabaseAdmin
      .from('salons')
      .select('id, slug, updated_at')
      .eq('status', 'APPROVED')
      .limit(50000);

    if (Array.isArray(salons)) {
      const seen = new Set<string>();
      for (const s of salons) {
        const id = (s as any).id as string | undefined;
        const slug = (s as any).slug as string | undefined;
        const updated = (s as any).updated_at as string | undefined;
        const lastModified = updated ? new Date(updated) : now;

        if (id && !seen.has(`id:${id}`)) {
          seen.add(`id:${id}`);
          salonEntries.push({
            url: `${baseUrl}/salon/${id}`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
        if (slug && !seen.has(`slug:${slug}`)) {
          seen.add(`slug:${slug}`);
          salonEntries.push({
            url: `${baseUrl}/salon-slug/${slug}`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }
  } catch (err) {
    console.error('[sitemap] salon fetch failed:', err);
  }

  return [...staticEntries, ...salonEntries];
}
