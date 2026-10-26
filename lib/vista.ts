"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import { abiertoAhora, km, norm } from "./format";
import type { Evento, Lugar } from "./types";

export function useLugaresFiltrados() {
  const { vista, filtros, ubicacion, ahora } = useStore();
  return useMemo(() => {
    const q = norm(filtros.q);
    const lista = vista.lugares
      .filter((l) => l.estado === "publicado")
      .filter((l) => (filtros.cats.length ? filtros.cats.includes(l.categoria) : true))
      .filter((l) => (filtros.zona === "todas" ? true : l.zona === filtros.zona))
      .filter((l) => (filtros.precio === "gratis" ? l.precio === 0 : filtros.precio === "economico" ? l.precio <= 1 : true))
      .filter((l) => (filtros.abierto ? abiertoAhora(l.horarios, ahora) : true))
      .filter((l) => (q ? norm(`${l.nombre} ${l.barrio} ${l.etiquetas.join(" ")} ${l.texto.es ?? ""}`).includes(q) : true))
      .map((l) => ({ l, d: km(ubicacion, l) }));
    lista.sort((a, b) => (filtros.orden === "cerca" ? a.d - b.d : filtros.orden === "valoracion" ? b.l.valoracion - a.l.valoracion : a.l.nombre.localeCompare(b.l.nombre, "es")));
    return lista;
  }, [vista.lugares, filtros, ubicacion, ahora]);
}

export function usePublicados(): Lugar[] {
  const { vista } = useStore();
  return useMemo(() => vista.lugares.filter((l) => l.estado === "publicado"), [vista.lugares]);
}

/** eventos que la app muestra: publicados y que todavía no terminaron */
export function useEventosVigentes(): Evento[] {
  const { vista, ahora } = useStore();
  return useMemo(
    () =>
      vista.eventos
        .filter((e) => e.estado === "publicado" && new Date(e.fin) > ahora)
        .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
    [vista.eventos, ahora],
  );
}

export function useAncho() {
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    const f = () => {
      setW(window.innerWidth);
      document.documentElement.style.setProperty("--zoom-tel", String(Math.min(1, Math.max(0.68, (window.innerHeight - 128) / 812))));
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return w;
}
