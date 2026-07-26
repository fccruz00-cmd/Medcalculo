import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-5xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-[15px] text-ink-600">
        O endereço não existe ou a calculadora foi movida. Tente buscar pelo nome do escore.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/buscar"
          className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Buscar calculadora
        </Link>
        <Link
          href="/calculadoras"
          className="rounded-md border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
        >
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
