"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const SLICES = [
  "60 UC",
  "M416",
  "AWM",
  "AKM",
  "Kar98K",
  "Groza",
  "M24",
  "SCAR-L",
  "UZI",
  "Vector",
  "DP-28",
  "Mini14",
];

const SLICE_ANGLE = 360 / SLICES.length; // 30 derece

// Renk paleti (site temasi)
const MIDNIGHT = "#0B1220";
const ROYAL = "#1F4FD6";
const ELECTRIC = "#2D6BFF";
const GOLD = "#D4AF37";
const CHAMPAGNE = "#F2D16B";

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(i: number) {
  const start = i * SLICE_ANGLE;
  const end = start + SLICE_ANGLE;
  const p1 = polar(200, 200, 190, start);
  const p2 = polar(200, 200, 190, end);
  return `M 200 200 L ${p1.x} ${p1.y} A 190 190 0 0 1 ${p2.x} ${p2.y} Z`;
}

export default function CarkPage() {
  const { data: session, status } = useSession();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ prize: string; wonUc: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/cark")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.remaining === "number") setRemaining(d.remaining);
      })
      .catch(() => {});
  }, [status]);

  async function spin() {
    if (spinning) return;
    setError(null);
    setResult(null);
    setSpinning(true);

    try {
      const res = await fetch("/api/cark", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir seyler ters gitti");
        setSpinning(false);
        return;
      }

      // Carki kazanilan dilime dondur (en az 6 tam tur + hedef dilim)
      const sliceCenter = data.index * SLICE_ANGLE + SLICE_ANGLE / 2;
      const target = 360 * 6 + (360 - sliceCenter);
      setRotation((r) => r + target - (r % 360));

      // Animasyon bitince sonucu goster
      setTimeout(() => {
        setResult({ prize: data.prize, wonUc: data.wonUc });
        setRemaining(data.remaining);
        setSpinning(false);
      }, 5300);
    } catch {
      setError("Baglanti hatasi, tekrar dene");
      setSpinning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white px-4 py-10 flex flex-col items-center">
      {/* Baslik */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center">
        <span className="text-[#F2D16B]">VSS</span>{" "}
        <span
          className="bg-gradient-to-r from-[#D4AF37] via-[#F2D16B] to-[#D4AF37] bg-clip-text text-transparent"
          style={{ textShadow: "0 0 30px rgba(212,175,55,0.35)" }}
        >
          ALTIN ÇARK
        </span>
      </h1>
      <p className="mt-2 text-sm text-[#8FA3C8] text-center">
        Günde 3 hak — çevir, şansını dene!
      </p>

      {status === "loading" && (
        <p className="mt-10 text-[#8FA3C8]">Yükleniyor...</p>
      )}

      {status === "unauthenticated" && (
        <div className="mt-10 text-center border border-[#1F4FD6]/40 bg-[#0B1220] rounded-xl p-8 max-w-sm">
          <p className="mb-4">Çarkı çevirmek için giriş yapmalısın.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 rounded-lg font-bold bg-[#2D6BFF] hover:bg-[#1F4FD6] transition"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {status === "authenticated" && (
        <>
          {/* Kalan hak */}
          <div className="mt-4 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#0B1220] text-sm">
            Kalan hak:{" "}
            <span className="font-bold text-[#F2D16B]">
              {remaining === null ? "..." : remaining}
            </span>{" "}
            / 3
          </div>

          {/* Cark */}
          <div className="relative mt-8" style={{ width: "min(90vw, 380px)" }}>
            {/* Isaretci (ok) */}
            <div
              className="absolute left-1/2 -top-1 z-20"
              style={{ transform: "translateX(-50%)" }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderTop: `24px solid ${CHAMPAGNE}`,
                  filter: "drop-shadow(0 0 8px rgba(242,209,107,0.8))",
                }}
              />
            </div>

            {/* Donen cark */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 5s cubic-bezier(0.12, 0.8, 0.18, 1)"
                  : "none",
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                {/* Dis altin cember */}
                <circle
                  cx="200"
                  cy="200"
                  r="197"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="5"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill={MIDNIGHT}
                />
                {SLICES.map((label, i) => {
                  const isUc = i === 0;
                  const fill = isUc
                    ? GOLD
                    : i % 2 === 0
                    ? MIDNIGHT
                    : "#101B33";
                  const textPos = polar(
                    200,
                    200,
                    130,
                    i * SLICE_ANGLE + SLICE_ANGLE / 2
                  );
                  const textRotate =
                    i * SLICE_ANGLE + SLICE_ANGLE / 2;
                  return (
                    <g key={i}>
                      <path
                        d={slicePath(i)}
                        fill={fill}
                        stroke={isUc ? CHAMPAGNE : ROYAL}
                        strokeWidth={isUc ? 2.5 : 1}
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        fill={isUc ? "#050608" : "#C9D6F2"}
                        fontSize={isUc ? 15 : 12}
                        fontWeight={isUc ? 800 : 600}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRotate} ${textPos.x} ${textPos.y})`}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
                {/* Merkez gobek */}
                <circle
                  cx="200"
                  cy="200"
                  r="34"
                  fill={MIDNIGHT}
                  stroke={GOLD}
                  strokeWidth="3"
                />
                <text
                  x="200"
                  y="200"
                  fill={CHAMPAGNE}
                  fontSize="16"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  VSS
                </text>
              </svg>
            </div>

            {/* Cark arkasi parlama */}
            <div
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                boxShadow:
                  "0 0 80px rgba(45,107,255,0.25), 0 0 40px rgba(212,175,55,0.2)",
              }}
            />
          </div>

          {/* Cevir butonu */}
          <button
            onClick={spin}
            disabled={spinning || remaining === 0}
            className="mt-8 px-10 py-3 rounded-xl font-extrabold text-lg tracking-wider
              bg-gradient-to-r from-[#D4AF37] to-[#F2D16B] text-[#050608]
              hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed
              shadow-[0_0_25px_rgba(212,175,55,0.35)]"
          >
            {spinning
              ? "ÇEVRİLİYOR..."
              : remaining === 0
              ? "YARIN TEKRAR GEL"
              : "ÇEVİR!"}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Sonuc */}
          {result && (
            <div
              className={`mt-6 max-w-sm w-full text-center rounded-xl p-6 border ${
                result.wonUc
                  ? "border-[#F2D16B] bg-gradient-to-b from-[#1a1505] to-[#0B1220] shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                  : "border-[#1F4FD6]/40 bg-[#0B1220]"
              }`}
            >
              {result.wonUc ? (
                <>
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-xl font-extrabold text-[#F2D16B]">
                    60 UC KAZANDIN!
                  </p>
                  <p className="mt-2 text-sm text-[#C9D6F2]">
                    Tebrikler! Ödülünü almak için Instagram&apos;dan{" "}
                    <a
                      href="https://instagram.com/vssespor"
                      target="_blank"
                      className="text-[#2D6BFF] underline"
                    >
                      @vssespor
                    </a>{" "}
                    hesabına DM at.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl mb-2">🔫</p>
                  <p className="text-lg font-bold text-[#C9D6F2]">
                    {result.prize} çıktı!
                  </p>
                  <p className="mt-1 text-sm text-[#8FA3C8]">
                    Bu sefer olmadı ama tarzın yerinde. Tekrar dene!
                  </p>
                </>
              )}
            </div>
          )}

          {/* Oran aciklamasi */}
          <p className="mt-10 text-[10px] leading-relaxed text-[#4A5875] text-center max-w-xs">
            Katılım tamamen ücretsizdir. 60 UC kazanma olasılığı %0,1&apos;dir;
            diğer dilimler eşit olasılıklıdır ve ödül içermez. Ayda en fazla 5
            adet 60 UC dağıtılır.
          </p>
        </>
      )}
    </main>
  );
}
