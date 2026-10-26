import type { Categoria, CategoriaEvento, Horario, Lugar, Zona } from "./types";

export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

export const pesos = (n: number) => "$ " + Math.round(n).toLocaleString("es-AR");

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** distancia en km entre dos puntos */
export function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const distanciaTexto = (d: number) => (d < 1 ? `${Math.round(d * 10) * 100} m` : d < 10 ? `${d.toFixed(1).replace(".", ",")} km` : `${Math.round(d)} km`);

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};

export function abiertoAhora(horarios: Horario[] | null, ahora: Date): boolean {
  if (!horarios) return true;
  const dia = ahora.getDay();
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  return horarios.some((h) => {
    const a = aMin(h.abre);
    let c = aMin(h.cierra);
    if (c <= a) c += 24 * 60;
    if (h.dias.includes(dia) && m >= a && m < c) return true;
    const ayer = (dia + 6) % 7;
    return h.dias.includes(ayer) && c > 24 * 60 && m < c - 24 * 60;
  });
}

const DIAS_CORTO = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function horarioTexto(horarios: Horario[] | null): string {
  if (!horarios) return "Siempre abierto";
  return horarios
    .map((h) => {
      const d = h.dias.length === 7 ? "Todos los días" : rangoDias(h.dias);
      return `${d}, ${h.abre} a ${h.cierra}`;
    })
    .join(" · ");
}

function rangoDias(dias: number[]) {
  const orden = [...dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (orden.length === 1) return cap(DIAS_CORTO[orden[0]]);
  const idx = orden.map((d) => (d + 6) % 7);
  const seguido = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (seguido) return `${cap(DIAS_CORTO[orden[0]])} a ${DIAS_CORTO[orden[orden.length - 1]]}`;
  return orden.map((d, i) => (i === 0 ? cap(DIAS_CORTO[d]) : DIAS_CORTO[d])).join(", ");
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const fechaCorta = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
};

export const hora = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const mismoDia = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function diaTexto(iso: string, hoy: Date) {
  const d = new Date(iso);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  if (mismoDia(d, hoy)) return "Hoy";
  if (mismoDia(d, manana)) return "Mañana";
  return `${cap(DIAS_LARGO[d.getDay()])} ${d.getDate()} de ${MESES_LARGO[d.getMonth()]}`;
}

const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function haceTexto(iso: string, ahora: Date) {
  const min = Math.round((ahora.getTime() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  if (d < 60) return `hace ${d} días`;
  return `hace ${Math.round(d / 30)} meses`;
}

export const diasDesde = (iso: string, ahora: Date) => Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86400000);

export const CATEGORIAS: Record<Categoria, { nombre: string; color: string; hex: number }> = {
  atraccion: { nombre: "Atracciones", color: "#1f6f94", hex: 0x1f6f94 },
  cultura: { nombre: "Museos y teatros", color: "#7a5ba8", hex: 0x7a5ba8 },
  gastronomia: { nombre: "Gastronomía", color: "#d9643a", hex: 0xd9643a },
  alojamiento: { nombre: "Alojamiento", color: "#2f8a69", hex: 0x2f8a69 },
  naturaleza: { nombre: "Naturaleza", color: "#5d9a3c", hex: 0x5d9a3c },
  ferias: { nombre: "Ferias y compras", color: "#c4912c", hex: 0xc4912c },
};

export const CATEGORIAS_EVENTO: Record<CategoriaEvento, string> = {
  musica: "Música",
  teatro: "Teatro",
  feria: "Ferias",
  deporte: "Deporte",
  gastronomia: "Gastronomía",
  "aire-libre": "Aire libre",
  museo: "Museos",
};

export const ZONAS: Record<Zona, string> = {
  centro: "Centro y Puerto Madero",
  "norte-caba": "Palermo, Recoleta y Belgrano",
  "sur-caba": "San Telmo, La Boca y Boedo",
  "oeste-caba": "Oeste de la ciudad",
  "zona-norte": "Zona Norte y Tigre",
  "zona-sur": "Zona Sur",
  "zona-oeste": "Zona Oeste",
};

export const PRECIO = ["Gratis", "$", "$$", "$$$"];

export function textoFicha(l: Pick<Lugar, "texto">, idioma: "es" | "en" | "pt") {
  return l.texto[idioma] ?? l.texto.es ?? "";
}

export function saludo(d: Date) {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buen día";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}
