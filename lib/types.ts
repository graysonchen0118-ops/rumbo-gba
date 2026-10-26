export type Idioma = "es" | "en" | "pt";

export type Categoria = "atraccion" | "cultura" | "gastronomia" | "alojamiento" | "naturaleza" | "ferias";

export type Zona = "centro" | "norte-caba" | "sur-caba" | "oeste-caba" | "zona-norte" | "zona-sur" | "zona-oeste";

export type EstadoFicha = "publicado" | "borrador";

export interface Horario {
  /** 0 domingo ... 6 sábado */
  dias: number[];
  abre: string;
  cierra: string;
}

export interface Lugar {
  id: string;
  nombre: string;
  categoria: Categoria;
  zona: Zona;
  barrio: string;
  direccion: string;
  lat: number;
  lon: number;
  /** null = siempre abierto (plaza, monumento, paseo) */
  horarios: Horario[] | null;
  precio: 0 | 1 | 2 | 3;
  valoracion: number;
  opiniones: number;
  fotos: string[];
  texto: Partial<Record<Idioma, string>>;
  comoLlegar: string;
  etiquetas: string[];
  verificado: string;
  estado: EstadoFicha;
}

export type CategoriaEvento = "musica" | "teatro" | "feria" | "deporte" | "gastronomia" | "aire-libre" | "museo";

export interface Evento {
  id: string;
  titulo: string;
  categoria: CategoriaEvento;
  lugar: string;
  barrio: string;
  lat: number;
  lon: number;
  inicio: string;
  fin: string;
  precio: string;
  foto: string;
  texto: Partial<Record<Idioma, string>>;
  estado: EstadoFicha;
}

export interface Tarifa {
  id: string;
  grupo: "colectivo" | "subte" | "tren" | "taxi" | "aeropuerto";
  nombre: string;
  detalle: string;
  monto: number;
  actualizada: string;
}

export type Aeropuerto = "eze" | "aep";

export interface OpcionLlegada {
  id: string;
  aeropuerto: Aeropuerto;
  tipo: "bus" | "taxi" | "app" | "colectivo" | "remis";
  titulo: string;
  minutos: [number, number];
  tarifaId?: string;
  precioTexto?: string;
  pago: string;
  donde: string;
  pasos: string[];
  nota?: string;
  destaque?: string;
}

export interface Recorrido {
  id: string;
  titulo: string;
  bajada: string;
  duracion: string;
  foto: string;
  paradas: string[];
}

export interface Persona {
  id: string;
  nombre: string;
  rol: string;
  foto: string;
}

export interface Actividad {
  id: string;
  quien: string;
  texto: string;
  cuando: string;
  tipo: "lugar" | "evento" | "tarifa" | "paquete" | "traduccion";
}

export interface Paquete {
  version: number;
  publicado: string;
  pesoMb: number;
  incluye: string[];
}
