import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'MedCálculo: Calculadoras e escores médicos em português',
    template: '%s | MedCálculo',
  },
  description:
    'Escores, regras de decisão e fórmulas médicas em português, com interpretação clínica, evidência e referências. Ferramenta de apoio à decisão para profissionais de saúde.',
  keywords: [
    'calculadora médica',
    'escore clínico',
    'escores médicos',
    'regra de decisão clínica',
    'medicina baseada em evidências',
  ],
  authors: [{ name: 'MedCálculo' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MedCálculo',
    title: 'MedCálculo: Calculadoras e escores médicos em português',
    description:
      'Escores, regras de decisão e fórmulas médicas em português, com interpretação clínica e referências.',
  },
};

export const viewport: Viewport = {
  themeColor: '#123b38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
