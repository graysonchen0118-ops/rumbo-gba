import type { Actividad, OpcionLlegada, Paquete, Persona, Recorrido, Tarifa } from "../types";
import { DIA } from "./lugares";

export function crearTarifas(hoy: Date): Tarifa[] {
  const hace = (d: number) => new Date(hoy.getTime() - d * DIA).toISOString();
  return [
    { id: "col-1", grupo: "colectivo", nombre: "Colectivo, hasta 3 km", detalle: "Con SUBE registrada", monto: 650, actualizada: hace(4) },
    { id: "col-2", grupo: "colectivo", nombre: "Colectivo, de 3 a 6 km", detalle: "Con SUBE registrada", monto: 725, actualizada: hace(4) },
    { id: "col-3", grupo: "colectivo", nombre: "Colectivo, de 6 a 12 km", detalle: "Con SUBE registrada", monto: 780, actualizada: hace(4) },
    { id: "col-4", grupo: "colectivo", nombre: "Colectivo, más de 27 km", detalle: "Tramo largo, por ejemplo desde Ezeiza", monto: 905, actualizada: hace(4) },
    { id: "subte", grupo: "subte", nombre: "Subte, un viaje", detalle: "Baja con la cantidad de viajes del mes", monto: 1150, actualizada: hace(11) },
    { id: "tren", grupo: "tren", nombre: "Tren, primera sección", detalle: "Mitre, Sarmiento y Roca", monto: 320, actualizada: hace(26) },
    { id: "taxi-bandera", grupo: "taxi", nombre: "Taxi, bajada de bandera", detalle: "Más cada 200 metros", monto: 1950, actualizada: hace(19) },
    { id: "taxi-eze", grupo: "aeropuerto", nombre: "Taxi oficial Ezeiza a la ciudad", detalle: "Precio fijo, se paga en el mostrador", monto: 38000, actualizada: hace(6) },
    { id: "bus-eze", grupo: "aeropuerto", nombre: "Bus de traslado Ezeiza al centro", detalle: "Hasta la terminal de Puerto Madero", monto: 21500, actualizada: hace(6) },
    { id: "taxi-aep", grupo: "aeropuerto", nombre: "Taxi oficial Aeroparque a la ciudad", detalle: "Precio fijo hasta Palermo o el centro", monto: 12500, actualizada: hace(6) },
    { id: "bus-conexion", grupo: "aeropuerto", nombre: "Bus entre Aeroparque y Ezeiza", detalle: "Para conexiones entre vuelos", monto: 24000, actualizada: hace(13) },
  ];
}

export const DESTINOS = [
  { id: "centro", nombre: "Centro y Microcentro", extraEze: 0, extraAep: 0, lat: -34.6037, lon: -58.3816 },
  { id: "palermo", nombre: "Palermo", extraEze: 5, extraAep: -5, lat: -34.588, lon: -58.43 },
  { id: "san-telmo", nombre: "San Telmo", extraEze: 0, extraAep: 5, lat: -34.621, lon: -58.372 },
  { id: "recoleta", nombre: "Recoleta", extraEze: 5, extraAep: -3, lat: -34.589, lon: -58.39 },
  { id: "madero", nombre: "Puerto Madero", extraEze: -3, extraAep: 3, lat: -34.611, lon: -58.363 },
];

export const OPCIONES_LLEGADA: OpcionLlegada[] = [
  {
    id: "eze-bus", aeropuerto: "eze", tipo: "bus", titulo: "Bus de traslado al centro", minutos: [50, 70], tarifaId: "bus-eze",
    pago: "Efectivo, tarjeta o transferencia en el mostrador",
    donde: "Hall de arribos de la Terminal A, mostrador a la derecha de la salida",
    pasos: ["Comprá el pasaje en el mostrador antes de salir del hall.", "Sale cada 30 minutos desde la dársena frente a la puerta 5.", "Baja en la terminal de Puerto Madero; desde ahí hay combis sin cargo a hoteles del centro."],
    destaque: "La opción más simple si llegás de día",
  },
  {
    id: "eze-taxi", aeropuerto: "eze", tipo: "taxi", titulo: "Taxi oficial del aeropuerto", minutos: [40, 60], tarifaId: "taxi-eze",
    pago: "Precio fijo, se paga antes de subir",
    donde: "Mostrador de taxis oficiales, dentro del hall de arribos",
    pasos: ["Pedí el viaje en el mostrador azul, nunca a quien te ofrece auto en la salida.", "Te dan un comprobante con el precio cerrado por zona.", "El chofer te espera en la fila de taxis, a la izquierda de la salida."],
    destaque: "La mejor de madrugada",
    nota: "Los ofrecimientos en el hall no son taxis oficiales.",
  },
  {
    id: "eze-app", aeropuerto: "eze", tipo: "app", titulo: "Auto por aplicación", minutos: [40, 65], precioTexto: "Según la aplicación, suele quedar cerca del taxi oficial",
    pago: "Tarjeta dentro de la aplicación",
    donde: "Zona de encuentro del estacionamiento, nivel 0",
    pasos: ["Conectate al wifi del aeropuerto o a datos para pedirlo.", "Elegí como punto de encuentro el estacionamiento, nivel 0.", "Verificá patente y nombre antes de subir."],
    nota: "Necesita conexión para pedirlo: si no tenés chip, usá el wifi del hall.",
  },
  {
    id: "eze-colectivo", aeropuerto: "eze", tipo: "colectivo", titulo: "Colectivo línea 8", minutos: [100, 140], tarifaId: "col-4",
    pago: "Solo tarjeta SUBE, no se acepta efectivo",
    donde: "Parada frente a la Terminal A, cruzando la calle de arribos",
    pasos: ["Conseguí la tarjeta SUBE en el kiosco del hall y cargala ahí mismo.", "Tomá el 8 con cartel Plaza de Mayo.", "Bajá en Avenida de Mayo para el centro, o seguí hasta La Boca."],
    destaque: "La más económica, si no llevás valijas grandes",
  },
  {
    id: "eze-remis", aeropuerto: "eze", tipo: "remis", titulo: "Remis con reserva", minutos: [45, 60], precioTexto: "Precio cerrado al reservar",
    pago: "Efectivo o tarjeta, según la agencia",
    donde: "El chofer espera con cartel en la salida de arribos",
    pasos: ["Reservá antes de volar y anotá el teléfono de la agencia.", "El chofer sigue tu vuelo, así que no hay recargo si se atrasa.", "Encontralo con tu nombre en el cartel, frente a la puerta de arribos."],
  },
  {
    id: "aep-colectivo", aeropuerto: "aep", tipo: "colectivo", titulo: "Colectivos 33 o 45", minutos: [30, 50], tarifaId: "col-2",
    pago: "Solo tarjeta SUBE, no se acepta efectivo",
    donde: "Parada sobre la Costanera, frente a la salida principal",
    pasos: ["Comprá la SUBE en el kiosco de la planta baja.", "El 33 va hacia Retiro y Plaza de Mayo; el 45 pasa por Constitución.", "Pedí que te avisen la parada si es tu primer viaje."],
    destaque: "La más económica",
  },
  {
    id: "aep-taxi", aeropuerto: "aep", tipo: "taxi", titulo: "Taxi oficial", minutos: [15, 30], tarifaId: "taxi-aep",
    pago: "Precio fijo, se paga en el mostrador",
    donde: "Mostrador de taxis frente a la cinta de equipaje",
    pasos: ["Pedilo en el mostrador antes de salir.", "Precio cerrado hasta Palermo, Recoleta o el centro.", "La fila de taxis está a la derecha de la salida."],
    destaque: "La más rápida al centro",
  },
  {
    id: "aep-app", aeropuerto: "aep", tipo: "app", titulo: "Auto por aplicación", minutos: [15, 35], precioTexto: "Según la aplicación",
    pago: "Tarjeta dentro de la aplicación",
    donde: "Dársena de autos particulares, frente al estacionamiento",
    pasos: ["Pedilo con el wifi del aeropuerto o con datos.", "Caminá hasta la dársena de particulares.", "Verificá patente y nombre antes de subir."],
  },
  {
    id: "aep-conexion", aeropuerto: "aep", tipo: "bus", titulo: "Bus a Ezeiza, para conexiones", minutos: [60, 90], tarifaId: "bus-conexion",
    pago: "Efectivo o tarjeta en el mostrador",
    donde: "Mostrador de traslados, hall central",
    pasos: ["Calculá tres horas entre un vuelo y otro.", "El bus sale cada hora en punto.", "Te deja en la Terminal A de Ezeiza."],
  },
];

export const ANTES_DE_SALIR = [
  { id: "sube", titulo: "Tarjeta SUBE", texto: "Colectivo, subte y tren se pagan con ella. Se compra y se carga en los kioscos del aeropuerto." },
  { id: "plata", titulo: "Pesos o tarjeta", texto: "El taxi oficial y el bus aceptan tarjeta. Para el kiosco y la SUBE conviene tener algo en efectivo." },
  { id: "wifi", titulo: "Wifi del aeropuerto", texto: "Gratis en los halls. Sirve para pedir un auto por aplicación; la guía de esta app no lo necesita." },
  { id: "ofrecimientos", titulo: "Ofrecimientos en el hall", texto: "Los autos que te ofrecen al salir no son oficiales. Los mostradores están adentro, a la vista." },
];

export const RECORRIDOS: Recorrido[] = [
  { id: "r-telmo", titulo: "San Telmo de domingo", bajada: "De la plaza al mercado, con feria y tango en el medio", duracion: "4 horas a pie", foto: "san-telmo", paradas: ["plaza-de-mayo", "cafe-inmigrantes", "mercado-san-telmo", "feria-san-telmo", "salteña"] },
  { id: "r-palermo", titulo: "Palermo verde", bajada: "Jardines, lagos y arte a la sombra de los bosques", duracion: "5 horas, a pie y en bici", foto: "rosedal", paradas: ["jardin-japones", "rosedal", "planetario", "heladeria-rosedal", "malba"] },
  { id: "r-boca", titulo: "La Boca y el Riachuelo", bajada: "Colores, fútbol y una usina convertida en sala", duracion: "3 horas, de día", foto: "caminito", paradas: ["caminito", "bombonera", "usina", "reserva"] },
  { id: "r-tigre", titulo: "Un día en Tigre", bajada: "Tren hasta el río, lancha por el delta y feria al volver", duracion: "Día completo", foto: "delta", paradas: ["delta", "isleña", "puerto-frutos", "museo-mate", "posada-rio"] },
];

export const EQUIPO: Persona[] = [
  { id: "lucia", nombre: "Lucía Ferreyra", rol: "Editora de contenidos", foto: "persona-1" },
  { id: "martin", nombre: "Martín Acosta", rol: "Coordinación", foto: "persona-2" },
  { id: "carla", nombre: "Carla Benítez", rol: "Traducciones", foto: "persona-3" },
  { id: "diego", nombre: "Diego Sosa", rol: "Fotografía y relevamiento", foto: "persona-4" },
];

export function crearActividad(hoy: Date): Actividad[] {
  const hace = (min: number) => new Date(hoy.getTime() - min * 60000).toISOString();
  return [
    { id: "a1", quien: "lucia", texto: "actualizó los horarios de Mercado de San Telmo", cuando: hace(38), tipo: "lugar" },
    { id: "a2", quien: "carla", texto: "tradujo al portugués la ficha de Caminito", cuando: hace(95), tipo: "traduccion" },
    { id: "a3", quien: "martin", texto: "publicó el paquete sin conexión versión 14", cuando: hace(260), tipo: "paquete" },
    { id: "a4", quien: "lucia", texto: "cargó el evento Caminata de los jacarandás", cuando: hace(410), tipo: "evento" },
    { id: "a5", quien: "diego", texto: "subió tres fotos nuevas de Puerto de Frutos", cuando: hace(1180), tipo: "lugar" },
    { id: "a6", quien: "martin", texto: "corrigió la tarifa del taxi oficial de Ezeiza", cuando: hace(8640), tipo: "tarifa" },
  ];
}

export function crearPaquete(hoy: Date): Paquete {
  return {
    version: 14,
    publicado: new Date(hoy.getTime() - 260 * 60000).toISOString(),
    pesoMb: 38,
    incluye: ["Guía de llegada de Ezeiza y Aeroparque", "Mapa del Gran Buenos Aires en tres niveles de zoom", "Fichas publicadas, sin galería", "Tarifas vigentes", "Eventos de los próximos 14 días"],
  };
}
