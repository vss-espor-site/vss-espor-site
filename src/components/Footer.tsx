export default function Footer() {
  return (
    <footer className="mt-20 border-t border-bg-border bg-bg-soft py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="neon-text font-semibold">
            {process.env.NEXT_PUBLIC_SITE_NAME || "TAKIM ADIN"}
          </span>
          . Tum haklari saklidir.
        </p>
        <p className="text-xs">PUBG Mobile e-spor toplulugu</p>
      </div>
    </footer>
  );
}
