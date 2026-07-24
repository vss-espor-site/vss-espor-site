import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-24 text-center">
      <div className="relative mb-8 h-40 w-40">
        <div className="absolute inset-0 rounded-full border border-neon-orange/30" />
        <div className="absolute inset-[25px] rounded-full border border-neon-orange/20" />
        <div className="absolute inset-[50px] rounded-full border border-neon-orange/10" />
        <div className="absolute inset-0 flex items-center justify-center font-hud text-4xl font-bold text-neon-orange">
          404
        </div>
      </div>
      <p className="mb-3 font-hud text-[11px] uppercase tracking-[0.35em] text-neon-orange">
        Bölge Dışına Çıktın
      </p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Bu koordinatlarda <span className="neon-text">hiçbir şey</span> yok
      </h1>
      <p className="mt-4 max-w-sm text-neutral-400">
        Aradığın sayfa kaldırılmış ya da hiç var olmamış olabilir. Güvenli bölgeye geri dön.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-sm bg-neon-green px-7 py-3 font-hud text-sm font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
