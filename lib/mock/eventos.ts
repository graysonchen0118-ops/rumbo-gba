import type { CategoriaEvento, Evento } from "../types";

type Semilla = {
  id: string;
  titulo: string;
  categoria: CategoriaEvento;
  lugar: string;
  barrio: string;
  lat: number;
  lon: number;
  /** días desde hoy y hora de inicio */
  dia: number;
  desde: string;
  /** duración en días (0 = termina el mismo día) y hora de cierre */
  dura: number;
  hasta: string;
  precio: string;
  foto: string;
  texto: Evento["texto"];
  estado?: Evento["estado"];
};

const E = (s: Semilla) => s;

/** El próximo día de la semana pedido (0 domingo), contando desde hoy */
const proximo = (hoy: Date, dow: number) => (dow - hoy.getDay() + 7) % 7;

export function crearEventos(hoy: Date): Evento[] {
  const dom = proximo(hoy, 0);
  const sab = proximo(hoy, 6);
  const jue = proximo(hoy, 4);
  const vie = proximo(hoy, 5);
  const semillas: Semilla[] = [
    E({ id: "ev-feria-telmo", titulo: "Feria de antigüedades de San Telmo", categoria: "feria", lugar: "Calle Defensa y Plaza Dorrego", barrio: "San Telmo", lat: -34.6205, lon: -58.3713, dia: dom, desde: "10:00", dura: 0, hasta: "17:00", precio: "Gratis", foto: "san-telmo-2", texto: {
      es: "Más de doscientos puestos sobre Defensa, desde Plaza de Mayo hasta Plaza Dorrego, con tango en la calle a partir de las cuatro.",
      en: "Over two hundred stalls along Defensa street, with street tango from four o'clock.",
      pt: "Mais de duzentas barracas na rua Defensa, com tango na rua a partir das quatro.",
    } }),
    E({ id: "ev-milonga-glorieta", titulo: "Milonga al aire libre en La Glorieta", categoria: "musica", lugar: "Barrancas de Belgrano", barrio: "Belgrano", lat: -34.5623, lon: -58.4493, dia: sab, desde: "19:00", dura: 0, hasta: "23:00", precio: "A la gorra", foto: "tango", texto: {
      es: "La milonga de la glorieta, con clase para principiantes a las siete y baile libre después. Se baila sobre baldosas, así que mejor calzado cómodo.",
      pt: "A milonga do coreto, com aula para iniciantes às sete e baile livre depois.",
    } }),
    E({ id: "ev-jacarandas", titulo: "Caminata de los jacarandás", categoria: "aire-libre", lugar: "Plaza Alemania", barrio: "Palermo", lat: -34.5745, lon: -58.4135, dia: 1, desde: "17:30", dura: 0, hasta: "19:30", precio: "Gratis con inscripción", foto: "jacarandas", texto: {
      es: "Recorrido de dos horas por las cuadras más violetas de Palermo y Recoleta, en la semana en que los jacarandás están en flor.",
      en: "A two-hour walk through the most purple blocks of Palermo and Recoleta, while the jacarandas are in bloom.",
      pt: "Caminhada de duas horas pelas quadras mais roxas de Palermo e Recoleta, na semana em que os jacarandás florescem.",
    } }),
    E({ id: "ev-colon-ciclo", titulo: "Orquesta Estable: ciclo de primavera", categoria: "musica", lugar: "Teatro Colón", barrio: "San Nicolás", lat: -34.601, lon: -58.383, dia: jue, desde: "20:00", dura: 0, hasta: "22:15", precio: "Desde $ 18.000", foto: "teatro-colon-2", texto: {
      es: "Programa de Brahms y Ginastera. Las localidades de paraíso salen a la venta el mismo día en boletería.",
      en: "Brahms and Ginastera. Top-gallery seats go on sale the same day at the box office.",
    } }),
    E({ id: "ev-futbol", titulo: "Fecha del torneo local en La Bombonera", categoria: "deporte", lugar: "La Bombonera", barrio: "La Boca", lat: -34.6356, lon: -58.3647, dia: sab, desde: "17:00", dura: 0, hasta: "19:00", precio: "Socios y paquetes turísticos", foto: "bombonera", texto: {
      es: "Las entradas no se venden en boletería: solo socios o paquetes con traslado. Llegar con dos horas de anticipación.",
      pt: "Os ingressos não são vendidos na bilheteria: só sócios ou pacotes com traslado. Chegar com duas horas de antecedência.",
    } }),
    E({ id: "ev-malba-muestra", titulo: "Muestra: Retratos del río", categoria: "museo", lugar: "MALBA", barrio: "Palermo", lat: -34.5771, lon: -58.4036, dia: -10, desde: "12:00", dura: 40, hasta: "20:00", precio: "$ 9.000, miércoles mitad de precio", foto: "museo", texto: {
      es: "Cuarenta fotógrafos del litoral retratan la vida sobre el Paraná y el Río de la Plata.",
      en: "Forty photographers from the river region portray life on the Paraná and the Río de la Plata.",
      pt: "Quarenta fotógrafos do litoral retratam a vida no Paraná e no Rio da Prata.",
    } }),
    E({ id: "ev-corrientes-comedia", titulo: "La pensión de doña Rosa", categoria: "teatro", lugar: "Teatro Lorca, Av. Corrientes 1530", barrio: "San Nicolás", lat: -34.6042, lon: -58.3893, dia: 0, desde: "21:00", dura: 0, hasta: "22:30", precio: "$ 22.000", foto: "avenida-noche", texto: {
      es: "Comedia de enredos en una pensión de 1950, con seis actores y un solo patio. Funciones de miércoles a domingo.",
    } }),
    E({ id: "ev-palermo-diseno", titulo: "Mercado de diseño de Plaza Serrano", categoria: "feria", lugar: "Plaza Cortázar", barrio: "Palermo", lat: -34.5886, lon: -58.4302, dia: sab, desde: "12:00", dura: 1, hasta: "20:00", precio: "Gratis", foto: "street-art", texto: {
      es: "Ropa, cerámica y joyería de diseñadores independientes, sábado y domingo alrededor de la plaza.",
      en: "Clothes, ceramics and jewellery from independent designers, Saturday and Sunday around the square.",
      pt: "Roupas, cerâmica e joias de designers independentes, sábado e domingo em volta da praça.",
    } }),
    E({ id: "ev-regata", titulo: "Regata de primavera en el río Luján", categoria: "deporte", lugar: "Paseo Victorica", barrio: "Tigre", lat: -34.4225, lon: -58.5805, dia: dom, desde: "09:00", dura: 0, hasta: "13:00", precio: "Gratis", foto: "kayak", texto: {
      es: "Los clubes de remo del delta compiten frente al Paseo Victorica. La mejor vista es desde el muelle del Club de Regatas.",
      pt: "Os clubes de remo do delta competem em frente ao Paseo Victorica.",
    } }),
    E({ id: "ev-mataderos", titulo: "Feria de Mataderos: destrezas criollas", categoria: "feria", lugar: "Feria de Mataderos", barrio: "Mataderos", lat: -34.6588, lon: -58.5017, dia: dom, desde: "11:00", dura: 0, hasta: "19:00", precio: "Gratis", foto: "gauchos", texto: {
      es: "Carrera de sortija a la tarde, chamamé en el escenario y empanadas al horno de barro desde el mediodía.",
      en: "Ring races in the afternoon, chamamé on stage and clay-oven empanadas from noon.",
    } }),
    E({ id: "ev-recoleta-noche", titulo: "Visita nocturna al Cementerio de la Recoleta", categoria: "aire-libre", lugar: "Cementerio de la Recoleta", barrio: "Recoleta", lat: -34.5875, lon: -58.3934, dia: vie, desde: "20:30", dura: 0, hasta: "22:00", precio: "$ 12.000, con reserva", foto: "recoleta-2", texto: {
      es: "Con linterna y guía, las historias que no se cuentan de día. Cupo de treinta personas por turno.",
      en: "Torch in hand, with a guide, the stories nobody tells by day. Thirty people per tour.",
      pt: "De lanterna e com guia, as histórias que não se contam de dia. Trinta pessoas por turno.",
    } }),
    E({ id: "ev-usina-cine", titulo: "Cine bajo las estrellas en la Usina", categoria: "aire-libre", lugar: "Usina del Arte", barrio: "La Boca", lat: -34.6286, lon: -58.3567, dia: vie, desde: "20:00", dura: 0, hasta: "22:30", precio: "Gratis", foto: "usina", texto: {
      es: "Clásicos del cine argentino en la explanada, con reposeras para los primeros que lleguen.",
    } }),
    E({ id: "ev-jazz-cafe", titulo: "Jazz en el Café de los Inmigrantes", categoria: "musica", lugar: "Café de los Inmigrantes", barrio: "Monserrat", lat: -34.609, lon: -58.38, dia: jue, desde: "21:30", dura: 0, hasta: "23:30", precio: "$ 6.000 con consumición", foto: "concierto", texto: {
      es: "Trío de piano, contrabajo y batería entre las mesas de mármol. Se recomienda reservar.",
      en: "Piano, double bass and drums between the marble tables. Booking recommended.",
      pt: "Trio de piano, contrabaixo e bateria entre as mesas de mármore. Recomenda-se reservar.",
    } }),
    E({ id: "ev-bicicleteada", titulo: "Bicicleteada por la Costanera Sur", categoria: "aire-libre", lugar: "Reserva Ecológica Costanera Sur", barrio: "Puerto Madero", lat: -34.6145, lon: -58.3525, dia: sab, desde: "09:30", dura: 0, hasta: "12:00", precio: "Gratis, bicis prestadas", foto: "reserva", texto: {
      es: "Doce kilómetros a ritmo de paseo con guías de la Reserva. Hay bicicletas prestadas para los que se anotan antes.",
      pt: "Doze quilômetros em ritmo de passeio com guias da Reserva. Há bicicletas emprestadas para quem se inscreve antes.",
    } }),
    E({ id: "ev-pena-lomas", titulo: "Peña folklórica en Lomas", categoria: "musica", lugar: "Club Social de Lomas de Zamora", barrio: "Lomas de Zamora", lat: -34.7605, lon: -58.4027, dia: sab, desde: "21:00", dura: 0, hasta: "02:00", precio: "$ 8.000", foto: "feria", texto: {
      es: "Zambas, chacareras y locro hasta tarde. La peña de los sábados en el club, con guitarreada al final.",
    } }),
    E({ id: "ev-cerveza-quilmes", titulo: "Fiesta de la cerveza artesanal", categoria: "gastronomia", lugar: "Ribera de Quilmes", barrio: "Quilmes", lat: -34.714, lon: -58.249, dia: sab, desde: "16:00", dura: 1, hasta: "23:00", precio: "Gratis, se paga lo que se toma", foto: "cerveza", texto: {
      es: "Veinte cervecerías de la zona sur frente al río, con bandas en vivo y patio de comidas.",
      en: "Twenty southern breweries on the riverfront, with live bands and a food court.",
      pt: "Vinte cervejarias da zona sul de frente para o rio, com bandas ao vivo e praça de alimentação.",
    } }),
    E({ id: "ev-caminito-tango", titulo: "Tango en la Vuelta de Rocha", categoria: "musica", lugar: "Caminito", barrio: "La Boca", lat: -34.6393, lon: -58.3626, dia: 2, desde: "15:00", dura: 0, hasta: "17:30", precio: "Gratis", foto: "tango", texto: {
      es: "Parejas de bailarines y bandoneón en vivo frente al Riachuelo, en la esquina de Caminito.",
      en: "Dancers and live bandoneón by the Riachuelo, on the corner of Caminito.",
    } }),
    E({ id: "ev-jazz-vl", titulo: "Jazz en la costa de Vicente López", categoria: "musica", lugar: "Paseo de la Costa", barrio: "Vicente López", lat: -34.523, lon: -58.4705, dia: dom, desde: "17:00", dura: 0, hasta: "20:00", precio: "Gratis", foto: "atardecer", texto: {
      es: "Escenario frente al río para ver el atardecer con música. Traer reposera y mate.",
      pt: "Palco de frente para o rio para ver o pôr do sol com música. Traga cadeira e chimarrão.",
    } }),
    E({ id: "ev-planetario", titulo: "Función de domo: el cielo del sur", categoria: "museo", lugar: "Planetario Galileo Galilei", barrio: "Palermo", lat: -34.5696, lon: -58.4116, dia: 1, desde: "17:00", dura: 6, hasta: "20:00", precio: "$ 7.000", foto: "lago", texto: {
      es: "Cuarenta minutos bajo la cúpula para aprender a encontrar la Cruz del Sur. Funciones cada hora.",
      en: "Forty minutes under the dome learning to find the Southern Cross. Shows every hour.",
    } }),
    E({ id: "ev-pulgas", titulo: "Noche de antigüedades en el Mercado de Pulgas", categoria: "feria", lugar: "Mercado de Pulgas", barrio: "Colegiales", lat: -34.5803, lon: -58.4458, dia: vie, desde: "18:00", dura: 0, hasta: "23:00", precio: "Gratis", foto: "san-telmo", texto: {
      es: "El galpón abre de noche con música, luces cálidas y descuentos de los anticuarios.",
    } }),
    E({ id: "ev-usina-muestra", titulo: "Muestra de fotografía del Riachuelo", categoria: "museo", lugar: "Usina del Arte", barrio: "La Boca", lat: -34.6286, lon: -58.3567, dia: -14, desde: "14:00", dura: 14, hasta: "20:00", precio: "Gratis", foto: "usina", texto: {
      es: "Último día de la muestra: cien años del Riachuelo en fotos de archivo y retratos de vecinos.",
    } }),
    E({ id: "ev-feria-libro-barrio", titulo: "Feria del libro de Palermo", categoria: "feria", lugar: "Plaza Armenia", barrio: "Palermo", lat: -34.5878, lon: -58.4268, dia: -3, desde: "11:00", dura: 2, hasta: "20:00", precio: "Gratis", foto: "ateneo-2", texto: {
      es: "Editoriales independientes y firmas de autores durante el fin de semana.",
    } }),
    E({ id: "ev-recital-parque", titulo: "Recital en el Parque Centenario", categoria: "musica", lugar: "Parque Centenario", barrio: "Caballito", lat: -34.6067, lon: -58.4357, dia: -2, desde: "18:00", dura: 0, hasta: "22:00", precio: "Gratis", foto: "concierto", texto: {
      es: "Bandas del oeste en el anfiteatro del parque.",
    } }),
    E({ id: "ev-gastro-costanera", titulo: "Festival de la empanada", categoria: "gastronomia", lugar: "Costanera Sur", barrio: "Puerto Madero", lat: -34.6125, lon: -58.355, dia: -8, desde: "12:00", dura: 2, hasta: "21:00", precio: "Gratis", foto: "empanadas-2", texto: {
      es: "Empanadas de todas las provincias en un solo paseo.",
    } }),
    E({ id: "ev-noche-museos", titulo: "La Noche de los Museos", categoria: "museo", lugar: "Museos de toda la ciudad", barrio: "Varios barrios", lat: -34.5839, lon: -58.3929, dia: sab + 7, desde: "20:00", dura: 1, hasta: "03:00", precio: "Gratis", foto: "museo-2", texto: {
      es: "Una noche al año los museos abren hasta la madrugada y el transporte público es gratis entre ellos. Conviene armar el recorrido antes.",
      en: "One night a year museums stay open until the small hours and public transport between them is free.",
      pt: "Uma noite por ano os museus abrem até de madrugada e o transporte entre eles é grátis.",
    } }),
    E({ id: "ev-delta-kayak", titulo: "Salida en kayak por el arroyo Gambado", categoria: "aire-libre", lugar: "Estación Fluvial de Tigre", barrio: "Delta de Tigre", lat: -34.4202, lon: -58.5797, dia: sab + 7, desde: "10:00", dura: 0, hasta: "15:00", precio: "$ 35.000 con almuerzo", foto: "kayak", texto: {
      es: "Cinco horas de remo suave con instructor, almuerzo en una isla y regreso en lancha.",
      en: "Five hours of gentle paddling with an instructor, lunch on an island and a boat back.",
    } }),
    E({ id: "ev-borrador-tango", titulo: "Festival de tango de barrio", categoria: "musica", lugar: "Plaza Dorrego", barrio: "San Telmo", lat: -34.6205, lon: -58.3713, dia: 12, desde: "18:00", dura: 2, hasta: "23:00", precio: "Gratis", foto: "tango", texto: {
      es: "Tres noches de orquestas típicas y milonga en la plaza.",
    }, estado: "borrador" }),
  ];

  return semillas.map(({ dia, desde, dura, hasta, estado, ...s }) => {
    const ini = new Date(hoy);
    ini.setDate(ini.getDate() + dia);
    const [hi, mi] = desde.split(":").map(Number);
    ini.setHours(hi, mi, 0, 0);
    const fin = new Date(ini);
    fin.setDate(fin.getDate() + dura);
    const [hf, mf] = hasta.split(":").map(Number);
    fin.setHours(hf, mf, 0, 0);
    if (fin <= ini) fin.setDate(fin.getDate() + 1);
    return { ...s, estado: estado ?? "publicado", inicio: ini.toISOString(), fin: fin.toISOString() };
  });
}
