import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medcalculo.example';

// Exigido pelo `output: 'export'` usado na publicação no GitHub Pages.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
