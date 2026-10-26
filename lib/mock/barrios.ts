import type { Zona } from "../types";

export const BARRIOS: { nombre: string; zona: Zona; lat: number; lon: number }[] = [
  { nombre: "San Nicolás", zona: "centro", lat: -34.6037, lon: -58.3835 },
  { nombre: "Monserrat", zona: "centro", lat: -34.6115, lon: -58.3815 },
  { nombre: "Puerto Madero", zona: "centro", lat: -34.6115, lon: -58.3625 },
  { nombre: "Retiro", zona: "centro", lat: -34.5925, lon: -58.3755 },
  { nombre: "Recoleta", zona: "norte-caba", lat: -34.5885, lon: -58.3965 },
  { nombre: "Palermo", zona: "norte-caba", lat: -34.5815, lon: -58.4245 },
  { nombre: "Belgrano", zona: "norte-caba", lat: -34.5615, lon: -58.4555 },
  { nombre: "Colegiales", zona: "norte-caba", lat: -34.5745, lon: -58.4485 },
  { nombre: "San Telmo", zona: "sur-caba", lat: -34.6215, lon: -58.3725 },
  { nombre: "La Boca", zona: "sur-caba", lat: -34.6345, lon: -58.3625 },
  { nombre: "Boedo", zona: "sur-caba", lat: -34.6305, lon: -58.4175 },
  { nombre: "Caballito", zona: "oeste-caba", lat: -34.6185, lon: -58.4385 },
  { nombre: "Mataderos", zona: "oeste-caba", lat: -34.6585, lon: -58.5025 },
  { nombre: "Tigre", zona: "zona-norte", lat: -34.4205, lon: -58.5805 },
  { nombre: "San Isidro", zona: "zona-norte", lat: -34.4725, lon: -58.5135 },
  { nombre: "Vicente López", zona: "zona-norte", lat: -34.5265, lon: -58.4755 },
  { nombre: "Avellaneda", zona: "zona-sur", lat: -34.6625, lon: -58.3655 },
  { nombre: "Lanús", zona: "zona-sur", lat: -34.7065, lon: -58.3915 },
  { nombre: "Lomas de Zamora", zona: "zona-sur", lat: -34.7605, lon: -58.4025 },
  { nombre: "Quilmes", zona: "zona-sur", lat: -34.7205, lon: -58.2545 },
  { nombre: "Ezeiza", zona: "zona-sur", lat: -34.8105, lon: -58.5265 },
  { nombre: "Morón", zona: "zona-oeste", lat: -34.6535, lon: -58.6195 },
  { nombre: "Ramos Mejía", zona: "zona-oeste", lat: -34.6435, lon: -58.5645 },
];

export const UBICACIONES = [
  { id: "obelisco", nombre: "Obelisco", detalle: "San Nicolás", lat: -34.6037, lon: -58.3816 },
  { id: "ezeiza", nombre: "Aeropuerto de Ezeiza", detalle: "Recién aterrizado", lat: -34.8222, lon: -58.5358 },
  { id: "palermo", nombre: "Palermo Soho", detalle: "Plaza Serrano", lat: -34.5886, lon: -58.4302 },
  { id: "san-telmo", nombre: "San Telmo", detalle: "Plaza Dorrego", lat: -34.6205, lon: -58.3713 },
  { id: "tigre", nombre: "Tigre", detalle: "Estación fluvial", lat: -34.4202, lon: -58.5797 },
];
