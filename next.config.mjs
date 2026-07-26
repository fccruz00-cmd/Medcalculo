/**
 * O site é publicado no GitHub Pages como HTML estático, em um subdiretório
 * (/Medcalculo). Essas opções só entram quando GITHUB_PAGES=true — definido
 * apenas no workflow de publicação — para que `npm run dev`, `npm run build` e
 * `npm start` continuem funcionando normalmente no ambiente local.
 */
const publicandoNoPages = process.env.GITHUB_PAGES === 'true';

/** Nome do repositório. É o subdiretório em que o Pages serve o site. */
const basePath = process.env.PAGES_BASE_PATH ?? '/Medcalculo';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  ...(publicandoNoPages && {
    output: 'export',
    basePath,
    // O Pages não tem servidor para otimizar imagens sob demanda.
    images: { unoptimized: true },
    // Gera calculadora/curb-65/index.html em vez de curb-65.html, que é o que
    // a hospedagem estática do Pages resolve de forma previsível.
    trailingSlash: true,
  }),
};

export default nextConfig;
