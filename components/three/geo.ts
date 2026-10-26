// Geografía simplificada del Gran Buenos Aires para la escena: costa del río, Capital,
// Riachuelo, autopistas y aeropuertos. 1 unidad = 1 km, el Obelisco en el origen,
// el este hacia +x y el norte hacia -z.

export const ORIGEN = { lat: -34.6037, lon: -58.3816 };
const KX = 111.32 * Math.cos((ORIGEN.lat * Math.PI) / 180);
const KZ = 110.57;

export const xz = (lat: number, lon: number): [number, number] => [(lon - ORIGEN.lon) * KX, -(lat - ORIGEN.lat) * KZ];

type P = [number, number];

/** costa del Río de la Plata, de noroeste a sureste */
export const COSTA: P[] = [
  [-34.36, -58.62],
  [-34.383, -58.6],
  [-34.405, -58.575],
  [-34.43, -58.545],
  [-34.465, -58.505],
  [-34.495, -58.48],
  [-34.515, -58.465],
  [-34.535, -58.445],
  [-34.548, -58.425],
  [-34.556, -58.408],
  [-34.565, -58.395],
  [-34.578, -58.383],
  [-34.588, -58.368],
  [-34.6, -58.36],
  [-34.612, -58.348],
  [-34.63, -58.345],
  [-34.642, -58.348],
  [-34.655, -58.33],
  [-34.675, -58.29],
  [-34.7, -58.255],
  [-34.72, -58.23],
  [-34.75, -58.19],
  [-34.785, -58.14],
  [-34.82, -58.09],
];

/** tierra firme: la costa más un cierre amplio hacia el interior */
export const TIERRA: P[] = [...COSTA, [-34.96, -58.02], [-34.96, -58.82], [-34.36, -58.82]];

/** Ciudad de Buenos Aires, por General Paz, el Riachuelo y la costa */
export const CABA: P[] = [
  [-34.536, -58.457],
  [-34.545, -58.49],
  [-34.565, -58.51],
  [-34.585, -58.525],
  [-34.612, -58.531],
  [-34.635, -58.528],
  [-34.655, -58.52],
  [-34.675, -58.5],
  [-34.692, -58.475],
  [-34.705, -58.462],
  [-34.69, -58.43],
  [-34.672, -58.405],
  [-34.66, -58.39],
  [-34.652, -58.37],
  [-34.642, -58.35],
  [-34.63, -58.345],
  [-34.612, -58.348],
  [-34.6, -58.36],
  [-34.588, -58.368],
  [-34.578, -58.383],
  [-34.565, -58.395],
  [-34.556, -58.408],
  [-34.548, -58.425],
];

export const RIACHUELO: P[] = [
  [-34.642, -58.349],
  [-34.652, -58.37],
  [-34.66, -58.39],
  [-34.672, -58.405],
  [-34.69, -58.43],
  [-34.705, -58.462],
  [-34.722, -58.492],
  [-34.735, -58.53],
];

/** islas del delta, al norte de Tigre: centro, radios y giro */
export const ISLAS: { lat: number; lon: number; rx: number; rz: number; giro: number }[] = [
  { lat: -34.345, lon: -58.585, rx: 3.2, rz: 1.4, giro: 0.5 },
  { lat: -34.33, lon: -58.54, rx: 2.6, rz: 1.1, giro: 0.7 },
  { lat: -34.37, lon: -58.545, rx: 2.2, rz: 0.9, giro: 0.4 },
  { lat: -34.315, lon: -58.62, rx: 2.8, rz: 1.2, giro: 0.6 },
  { lat: -34.3, lon: -58.57, rx: 2.1, rz: 1, giro: 0.8 },
  { lat: -34.355, lon: -58.5, rx: 1.8, rz: 0.8, giro: 0.5 },
  { lat: -34.285, lon: -58.51, rx: 2.4, rz: 1, giro: 0.65 },
];

export const AUTOPISTAS: P[][] = [
  // Riccheri y Dellepiane, de Ezeiza al centro
  [[-34.815, -58.535], [-34.77, -58.53], [-34.72, -58.515], [-34.69, -58.495], [-34.66, -58.47], [-34.645, -58.44], [-34.625, -58.4], [-34.61, -58.385], [-34.6037, -58.3816]],
  // Panamericana
  [[-34.545, -58.49], [-34.51, -58.52], [-34.47, -58.56], [-34.43, -58.6]],
  // Acceso Oeste
  [[-34.62, -58.53], [-34.64, -58.62], [-34.655, -58.72]],
  // Autopista a La Plata
  [[-34.64, -58.355], [-34.69, -58.28], [-34.75, -58.2], [-34.8, -58.12]],
  // General Paz
  [[-34.536, -58.457], [-34.565, -58.51], [-34.612, -58.531], [-34.655, -58.52], [-34.705, -58.462]],
  // Camino de Cintura
  [[-34.47, -58.6], [-34.6, -58.66], [-34.73, -58.6], [-34.82, -58.45], [-34.84, -58.3]],
];

export const AEROPUERTOS = {
  eze: { nombre: "Ezeiza", lat: -34.8222, lon: -58.5358, giro: 0.35 },
  aep: { nombre: "Aeroparque", lat: -34.5592, lon: -58.4156, giro: -0.85 },
};

/** recorrido del aeropuerto al destino, por autopista */
export const RUTA_LLEGADA = {
  eze: [[-34.8222, -58.5358], [-34.815, -58.535], [-34.77, -58.53], [-34.72, -58.515], [-34.69, -58.495], [-34.66, -58.47], [-34.645, -58.44], [-34.625, -58.4], [-34.61, -58.385]] as P[],
  aep: [[-34.5592, -58.4156], [-34.566, -58.405], [-34.575, -58.395], [-34.585, -58.388], [-34.596, -58.383]] as P[],
};

export const PARTIDOS: { nombre: string; lat: number; lon: number; grande?: boolean }[] = [
  { nombre: "Ciudad de Buenos Aires", lat: -34.628, lon: -58.455, grande: true },
  { nombre: "Tigre", lat: -34.44, lon: -58.63 },
  { nombre: "San Isidro", lat: -34.49, lon: -58.55 },
  { nombre: "Vicente López", lat: -34.52, lon: -58.5 },
  { nombre: "San Martín", lat: -34.575, lon: -58.56 },
  { nombre: "Morón", lat: -34.655, lon: -58.63 },
  { nombre: "La Matanza", lat: -34.73, lon: -58.62 },
  { nombre: "Ezeiza", lat: -34.86, lon: -58.53 },
  { nombre: "Esteban Echeverría", lat: -34.8, lon: -58.46 },
  { nombre: "Lomas de Zamora", lat: -34.765, lon: -58.4 },
  { nombre: "Lanús", lat: -34.71, lon: -58.385 },
  { nombre: "Avellaneda", lat: -34.672, lon: -58.355 },
  { nombre: "Quilmes", lat: -34.76, lon: -58.27 },
  { nombre: "Río de la Plata", lat: -34.52, lon: -58.27, grande: true },
];

/** antenas de telefonía, para mostrar la señal que va y viene */
export const ANTENAS: P[] = [
  [-34.6, -58.43],
  [-34.53, -58.52],
  [-34.71, -58.36],
  [-34.79, -58.52],
  [-34.43, -58.59],
];
