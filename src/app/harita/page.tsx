"use client";

import dynamic from "next/dynamic";

const GameMap = dynamic(() => import("@/components/GameMap"), {
  ssr: false,
  loading: () => <p>Harita yükleniyor...</p>,
});

export default function HaritaPage() {
  return (
    <div>
      <h1>PUBG Mobile Harita</h1>
      <GameMap />
    </div>
  );
}
