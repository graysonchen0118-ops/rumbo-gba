"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Actividad, Aeropuerto, Categoria, Evento, Idioma, Lugar, Paquete, Tarifa, Zona } from "./types";
import { crearLugares } from "./mock/lugares";
import { crearEventos } from "./mock/eventos";
import { crearActividad, crearPaquete, crearTarifas, EQUIPO } from "./mock/transporte";
import { UBICACIONES } from "./mock/barrios";
import { espera, uid } from "./format";

export type Tab = "explorar" | "mapa" | "llegada" | "agenda" | "guardados";

export interface Filtros {
  q: string;
  cats: Categoria[];
  zona: Zona | "todas";
  precio: "todos" | "gratis" | "economico";
  abierto: boolean;
  orden: "cerca" | "valoracion" | "nombre";
}

export const FILTROS_BASE: Filtros = { q: "", cats: [], zona: "todas", precio: "todos", abierto: false, orden: "cerca" };

export interface Toast {
  id: string;
  texto: string;
  tono: "ok" | "error" | "info";
}

interface Datos {
  lugares: Lugar[];
  eventos: Evento[];
  tarifas: Tarifa[];
  paquete: Paquete;
}

interface Ctx extends Datos {
  listo: boolean;
  ahora: Date;
  vista: Datos;
  pendientes: number;
  actividad: Actividad[];
  tab: Tab;
  irA: (t: Tab) => void;
  lugarSel: string | null;
  abrirLugar: (id: string) => void;
  cerrarLugar: () => void;
  eventoSel: string | null;
  abrirEvento: (id: string) => void;
  cerrarEvento: () => void;
  foco: string | null;
  enfocar: (id: string | null) => void;
  filtros: Filtros;
  setFiltros: (f: Partial<Filtros>) => void;
  limpiarFiltros: () => void;
  favoritos: string[];
  alternarFavorito: (id: string) => void;
  idioma: Idioma;
  setIdioma: (i: Idioma) => void;
  sinDatos: boolean;
  alternarSinDatos: () => void;
  ubicacion: (typeof UBICACIONES)[number];
  setUbicacion: (id: string) => void;
  aeropuerto: Aeropuerto;
  setAeropuerto: (a: Aeropuerto) => void;
  destino: string;
  setDestino: (d: string) => void;
  rutaVisible: boolean;
  setRutaVisible: (v: boolean) => void;
  recorrido: string | null;
  setRecorrido: (id: string | null) => void;
  agendaGuardada: string;
  actualizarAgenda: () => Promise<void>;
  toasts: Toast[];
  toast: (texto: string, tono?: Toast["tono"]) => void;
  guardarLugar: (l: Lugar, nuevo: boolean) => Promise<void>;
  eliminarLugar: (id: string) => Promise<void>;
  estadoLugar: (id: string, estado: Lugar["estado"]) => Promise<void>;
  verificarLugar: (id: string) => Promise<void>;
  guardarEvento: (e: Evento, nuevo: boolean) => Promise<void>;
  eliminarEvento: (id: string) => Promise<void>;
  guardarTarifa: (id: string, monto: number) => Promise<void>;
  publicarPaquete: () => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fuera del proveedor");
  return c;
}

export class ErrorValidacion extends Error {}

const emitir = (nombre: string, detalle?: unknown) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
};

const leer = <T,>(k: string, base: T): T => {
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : base;
  } catch {
    return base;
  }
};
const escribir = (k: string, v: unknown) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sin almacenamiento: sigue funcionando en memoria */
  }
};

const VACIO: Paquete = { version: 0, publicado: new Date(0).toISOString(), pesoMb: 0, incluye: [] };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [listo, setListo] = useState(false);
  const [ahora, setAhora] = useState(() => new Date(0));
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [paquete, setPaquete] = useState<Paquete>(VACIO);
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [tab, setTab] = useState<Tab>("explorar");
  const [lugarSel, setLugarSel] = useState<string | null>(null);
  const [eventoSel, setEventoSel] = useState<string | null>(null);
  const [foco, setFoco] = useState<string | null>(null);
  const [filtros, setFiltrosState] = useState<Filtros>(FILTROS_BASE);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [idioma, setIdiomaState] = useState<Idioma>("es");
  const [sinDatos, setSinDatos] = useState(false);
  const [foto, setFoto] = useState<Datos | null>(null);
  const [ubicacionId, setUbicacionId] = useState("obelisco");
  const [aeropuerto, setAeropuerto] = useState<Aeropuerto>("eze");
  const [destino, setDestino] = useState("centro");
  const [rutaVisible, setRutaVisible] = useState(false);
  const [recorrido, setRecorrido] = useState<string | null>(null);
  const [agendaGuardada, setAgendaGuardada] = useState(new Date(0).toISOString());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const vivo = useMemo<Datos>(() => ({ lugares, eventos, tarifas, paquete }), [lugares, eventos, tarifas, paquete]);
  const vivoRef = useRef(vivo);
  vivoRef.current = vivo;

  useEffect(() => {
    let activo = true;
    const hoy = new Date();
    setAhora(hoy);
    setFavoritos(leer("rumbo:favoritos", ["obelisco", "tranquera", "ev-milonga-glorieta"]));
    setIdiomaState(leer<Idioma>("rumbo:idioma", "es"));
    setAgendaGuardada(new Date(hoy.getTime() - 2 * 3600000 - 14 * 60000).toISOString());
    (async () => {
      await espera(650);
      if (!activo) return;
      setLugares(crearLugares(hoy));
      setEventos(crearEventos(hoy));
      setTarifas(crearTarifas(hoy));
      setPaquete(crearPaquete(hoy));
      setActividad(crearActividad(hoy));
      setListo(true);
    })();
    const reloj = setInterval(() => setAhora(new Date()), 30000);
    return () => {
      activo = false;
      clearInterval(reloj);
    };
  }, []);

  const toast = useCallback((texto: string, tono: Toast["tono"] = "ok") => {
    const id = uid("t");
    setToasts((t) => [...t.slice(-2), { id, texto, tono }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const vista = sinDatos && foto ? foto : vivo;

  const pendientes = useMemo(() => {
    if (!sinDatos || !foto) return 0;
    const contar = <T extends { id: string }>(a: T[], b: T[]) => {
      const mapa = new Map(a.map((x) => [x.id, JSON.stringify(x)]));
      let n = 0;
      b.forEach((x) => {
        if (mapa.get(x.id) !== JSON.stringify(x)) n++;
        mapa.delete(x.id);
      });
      return n + mapa.size;
    };
    return contar(foto.lugares, lugares) + contar(foto.eventos, eventos) + contar(foto.tarifas, tarifas) + (foto.paquete.version !== paquete.version ? 1 : 0);
  }, [sinDatos, foto, lugares, eventos, tarifas, paquete]);

  const pendRef = useRef(0);
  pendRef.current = pendientes;

  const sinRef = useRef(sinDatos);
  sinRef.current = sinDatos;

  const alternarSinDatos = useCallback(() => {
    const nuevo = !sinRef.current;
    if (nuevo) {
      setFoto(vivoRef.current);
      toast("Sin conexión: la app sigue con lo guardado en el teléfono", "info");
    } else {
      const n = pendRef.current;
      setFoto(null);
      setAgendaGuardada(new Date().toISOString());
      toast(n > 0 ? `Volvió la señal: ${n} ${n === 1 ? "cambio nuevo ya está" : "cambios nuevos ya están"} en la app` : "Volvió la señal", "ok");
    }
    sinRef.current = nuevo;
    setSinDatos(nuevo);
    emitir("rumbo:senal", { sinDatos: nuevo });
  }, [toast]);

  const setFiltros = useCallback((f: Partial<Filtros>) => setFiltrosState((x) => ({ ...x, ...f })), []);
  const limpiarFiltros = useCallback(() => setFiltrosState(FILTROS_BASE), []);

  const favRef = useRef(favoritos);
  favRef.current = favoritos;

  const alternarFavorito = useCallback(
    (id: string) => {
      const f = favRef.current;
      const esta = f.includes(id);
      const n = esta ? f.filter((x) => x !== id) : [id, ...f];
      favRef.current = n;
      setFavoritos(n);
      escribir("rumbo:favoritos", n);
      toast(esta ? "Quitado de guardados" : "Guardado en el teléfono, disponible sin conexión", esta ? "info" : "ok");
      emitir("rumbo:favorito", { id, guardado: !esta });
    },
    [toast],
  );

  const setIdioma = useCallback((i: Idioma) => {
    setIdiomaState(i);
    escribir("rumbo:idioma", i);
  }, []);

  const abrirLugar = useCallback((id: string) => {
    setEventoSel(null);
    setLugarSel(id);
    setFoco(id);
  }, []);

  const irA = useCallback((t: Tab) => {
    setTab(t);
    setLugarSel(null);
    setEventoSel(null);
    if (t !== "mapa") setFoco(null);
    if (t !== "mapa") setRecorrido(null);
    if (t === "llegada") setRutaVisible(true);
    else if (t !== "mapa") setRutaVisible(false);
  }, []);

  const actualizarAgenda = useCallback(async () => {
    await espera(900);
    if (sinDatos) throw new Error("Sin conexión. Te mostramos la agenda guardada.");
    setAgendaGuardada(new Date().toISOString());
  }, [sinDatos]);

  const registrar = useCallback((texto: string, tipo: Actividad["tipo"], quien = "lucia") => {
    setActividad((a) => [{ id: uid("a"), quien, texto, cuando: new Date().toISOString(), tipo }, ...a].slice(0, 30));
  }, []);

  const guardarLugar = useCallback(
    async (l: Lugar, nuevo: boolean) => {
      if (!l.nombre.trim()) throw new ErrorValidacion("La ficha necesita un nombre.");
      if (!l.texto.es?.trim()) throw new ErrorValidacion("Falta la descripción en español, que es la base de la ficha.");
      if (nuevo && vivoRef.current.lugares.some((x) => x.nombre.trim().toLowerCase() === l.nombre.trim().toLowerCase())) {
        throw new ErrorValidacion("Ya hay una ficha con ese nombre.");
      }
      await espera(700);
      setLugares((ls) => (nuevo ? [l, ...ls] : ls.map((x) => (x.id === l.id ? l : x))));
      registrar(`${nuevo ? "cargó" : "editó"} la ficha de ${l.nombre}`, "lugar");
      emitir(nuevo ? "rumbo:pin" : "rumbo:pulso", { id: l.id, lat: l.lat, lon: l.lon });
    },
    [registrar],
  );

  const eliminarLugar = useCallback(
    async (id: string) => {
      await espera(500);
      const l = vivoRef.current.lugares.find((x) => x.id === id);
      setLugares((ls) => ls.filter((x) => x.id !== id));
      setFavoritos((f) => f.filter((x) => x !== id));
      if (l) registrar(`eliminó la ficha de ${l.nombre}`, "lugar");
    },
    [registrar],
  );

  const estadoLugar = useCallback(
    async (id: string, estado: Lugar["estado"]) => {
      await espera(450);
      setLugares((ls) => ls.map((x) => (x.id === id ? { ...x, estado } : x)));
      const l = vivoRef.current.lugares.find((x) => x.id === id);
      if (l) registrar(`${estado === "publicado" ? "publicó" : "pasó a borrador"} ${l.nombre}`, "lugar");
    },
    [registrar],
  );

  const verificarLugar = useCallback(
    async (id: string) => {
      await espera(450);
      const ahora = new Date().toISOString();
      setLugares((ls) => ls.map((x) => (x.id === id ? { ...x, verificado: ahora } : x)));
      const l = vivoRef.current.lugares.find((x) => x.id === id);
      if (l) {
        registrar(`verificó en persona ${l.nombre}`, "lugar", "diego");
        emitir("rumbo:pulso", { id, lat: l.lat, lon: l.lon });
      }
    },
    [registrar],
  );

  const guardarEvento = useCallback(
    async (e: Evento, nuevo: boolean) => {
      if (!e.titulo.trim()) throw new ErrorValidacion("El evento necesita un título.");
      if (new Date(e.fin) <= new Date(e.inicio)) throw new ErrorValidacion("La fecha de fin tiene que ser posterior al inicio.");
      await espera(650);
      setEventos((es) => (nuevo ? [e, ...es] : es.map((x) => (x.id === e.id ? e : x))));
      registrar(`${nuevo ? "cargó" : "editó"} el evento ${e.titulo}`, "evento");
      emitir("rumbo:pulso", { id: e.id, lat: e.lat, lon: e.lon });
    },
    [registrar],
  );

  const eliminarEvento = useCallback(
    async (id: string) => {
      await espera(500);
      const e = vivoRef.current.eventos.find((x) => x.id === id);
      setEventos((es) => es.filter((x) => x.id !== id));
      if (e) registrar(`eliminó el evento ${e.titulo}`, "evento");
    },
    [registrar],
  );

  const guardarTarifa = useCallback(
    async (id: string, monto: number) => {
      if (!Number.isFinite(monto) || monto <= 0) throw new ErrorValidacion("El monto tiene que ser un número mayor a cero.");
      await espera(600);
      const t = vivoRef.current.tarifas.find((x) => x.id === id);
      setTarifas((ts) => ts.map((x) => (x.id === id ? { ...x, monto, actualizada: new Date().toISOString() } : x)));
      if (t) {
        registrar(`corrigió la tarifa ${t.nombre}`, "tarifa", "martin");
        emitir("rumbo:tarifa", { id, grupo: t.grupo });
      }
    },
    [registrar],
  );

  const publicarPaquete = useCallback(async () => {
    await espera(1400);
    setPaquete((p) => ({ ...p, version: p.version + 1, publicado: new Date().toISOString(), pesoMb: p.pesoMb + (Math.random() > 0.5 ? 1 : 0) }));
    registrar(`publicó el paquete sin conexión versión ${vivoRef.current.paquete.version + 1}`, "paquete", "martin");
    emitir("rumbo:paquete");
  }, [registrar]);

  const ubicacion = UBICACIONES.find((u) => u.id === ubicacionId) ?? UBICACIONES[0];

  const valor: Ctx = {
    listo,
    ahora,
    lugares,
    eventos,
    tarifas,
    paquete,
    vista,
    pendientes,
    actividad,
    tab,
    irA,
    lugarSel,
    abrirLugar,
    cerrarLugar: () => setLugarSel(null),
    eventoSel,
    abrirEvento: (id: string) => {
      setLugarSel(null);
      setEventoSel(id);
    },
    cerrarEvento: () => setEventoSel(null),
    foco,
    enfocar: setFoco,
    filtros,
    setFiltros,
    limpiarFiltros,
    favoritos,
    alternarFavorito,
    idioma,
    setIdioma,
    sinDatos,
    alternarSinDatos,
    ubicacion,
    setUbicacion: setUbicacionId,
    aeropuerto,
    setAeropuerto,
    destino,
    setDestino,
    rutaVisible,
    setRutaVisible,
    recorrido,
    setRecorrido,
    agendaGuardada,
    actualizarAgenda,
    toasts,
    toast,
    guardarLugar,
    eliminarLugar,
    estadoLugar,
    verificarLugar,
    guardarEvento,
    eliminarEvento,
    guardarTarifa,
    publicarPaquete,
  };

  return <StoreCtx.Provider value={valor}>{children}</StoreCtx.Provider>;
}

export { EQUIPO };
