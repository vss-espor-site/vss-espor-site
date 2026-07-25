import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-bg-border bg-bg-soft py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 md:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="VSS E-Sports" width={32} height={32} />
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="neon-text font-semibold">VSS E-Sports</span>
            . Tüm hakları saklıdır.
          </p>
        </div>
        <p className="text-xs">PUBG Mobile e-spor topluluğu</p>
      </div>
    </footer>
  );
}
