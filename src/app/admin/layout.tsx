"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const tabs = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/players", label: "Oyuncular" },
  { href: "/admin/tournaments", label: "Turnuvalar" },
  { href: "/admin/announcements", label: "Duyurular" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === t.href
                  ? "bg-neon-green text-black"
                  : "text-neutral-400 hover:text-neon-green"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-md border border-bg-border px-3 py-2 text-sm text-neutral-400 hover:border-neon-yellow hover:text-neon-yellow"
          >
            Cikis Yap
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
