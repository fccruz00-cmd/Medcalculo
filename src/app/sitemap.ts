import type { MetadataRoute } from 'next';
import { allCalculators, getSpecialties } from '@/data/registry';
import { slugify } from '@/lib/utils';

/** Ajuste via NEXT_PUBLIC_SITE_URL ao publicar em domínio próprio. */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medcalculo.example';

// Exigido pelo `output: 'export'` usado na publicação no GitHub Pages.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/calculadoras`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/especialidades`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/sobre`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const especialidades: MetadataRoute.Sitemap = getSpecialties().map((specialty) => ({
    url: `${BASE_URL}/especialidades/${slugify(specialty.name)}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const calculadoras: MetadataRoute.Sitemap = allCalculators.map((calc) => ({
    url: `${BASE_URL}/calculadora/${calc.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...estaticas, ...especialidades, ...calculadoras];
}
