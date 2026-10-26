"use client";

import dynamic from "next/dynamic";

export const MapaGBA = dynamic(() => import("./MapaGBA"), {
  ssr: false,
  loading: () => <div className="mapa3d-ph" aria-hidden="true" />,
});
