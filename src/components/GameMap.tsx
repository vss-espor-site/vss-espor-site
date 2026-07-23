"use client";

import { useState } from "react";
import { MapContainer, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const bounds: L.LatLngBoundsExpression = [
  [0, 0],
  [1000, 1000],
];

const maps = [
  { id: "erangel", label: "Erangel", file: "/maps/erangel.jpg" },
  { id: "miramar", label: "Miramar", file: "/maps/miramar.jpg" },
  { id: "sanhok", label: "Sanhok", file: "/maps/sanhok.jpg" },
];

export default function GameMap() {
  const [selected, setSelected] = useState(maps[0].id);
  const currentMap = maps.find((m) => m.id === selected)!;

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {maps.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: selected === m.id ? "#22c55e" : "#1a1a1a",
              color: selected === m.id ? "#000" : "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: "800px", margin: "0 auto" }}>
        <MapContainer
          key={currentMap.id}
          bounds={bounds}
          crs={L.CRS.Simple}
          style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
          maxBounds={bounds}
          minZoom={-2}
          maxZoom={3}
        >
          <ImageOverlay url={currentMap.file} bounds={bounds} />
        </MapContainer>
      </div>
    </div>
  );
}
