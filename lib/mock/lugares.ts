import type { Categoria, Horario, Lugar, Zona } from "../types";

const TODOS = [0, 1, 2, 3, 4, 5, 6];
const MAR_DOM = [0, 2, 3, 4, 5, 6];
const MIE_DOM = [0, 3, 4, 5, 6];
const LUN_SAB = [1, 2, 3, 4, 5, 6];
const h = (dias: number[], abre: string, cierra: string): Horario => ({ dias, abre, cierra });

type Semilla = Omit<Lugar, "verificado" | "estado"> & { verificadoHace: number; estado?: Lugar["estado"] };

const S = (
  id: string,
  nombre: string,
  categoria: Categoria,
  zona: Zona,
  barrio: string,
  direccion: string,
  lat: number,
  lon: number,
  horarios: Horario[] | null,
  precio: Lugar["precio"],
  valoracion: number,
  opiniones: number,
  fotos: string[],
  texto: Lugar["texto"],
  comoLlegar: string,
  etiquetas: string[],
  verificadoHace: number,
  estado?: Lugar["estado"],
): Semilla => ({ id, nombre, categoria, zona, barrio, direccion, lat, lon, horarios, precio, valoracion, opiniones, fotos, texto, comoLlegar, etiquetas, verificadoHace, estado });

const SEMILLAS: Semilla[] = [
  S("obelisco", "Obelisco", "atraccion", "centro", "San Nicolás", "Av. 9 de Julio y Av. Corrientes", -34.6037, -58.3816, null, 0, 4.6, 18420, ["obelisco", "obelisco-2", "avenida-noche"], {
    es: "El punto donde se cruzan la 9 de Julio y Corrientes. De noche, con los teatros encendidos alrededor, es la postal que todos quieren llevarse.",
    en: "Where 9 de Julio meets Corrientes. At night, with the theatre lights around it, it is the photo everyone wants.",
    pt: "O cruzamento da 9 de Julio com a Corrientes. À noite, com os teatros acesos em volta, é a foto que todo mundo quer levar.",
  }, "Subte B, estación Carlos Pellegrini, o Subte D, estación 9 de Julio", ["Gratis", "Ideal de noche", "Accesible"], 3),
  S("teatro-colon", "Teatro Colón", "cultura", "centro", "San Nicolás", "Cerrito 628", -34.601, -58.383, [h(TODOS, "09:00", "17:00")], 2, 4.9, 9312, ["teatro-colon", "teatro-colon-2", "avenida-noche"], {
    es: "Una de las salas líricas más importantes del mundo. La visita guiada recorre el foyer, la sala y los talleres, y conviene sacarla con un día de anticipación.",
    en: "One of the great opera houses of the world. The guided tour covers the foyer, the hall and the workshops; book a day ahead.",
    pt: "Uma das casas de ópera mais importantes do mundo. A visita guiada passa pelo foyer, pela sala e pelas oficinas; vale reservar com um dia de antecedência.",
  }, "Subte D, estación Tribunales", ["Visita guiada", "Ideal con lluvia", "Accesible"], 6),
  S("caminito", "Caminito", "atraccion", "sur-caba", "La Boca", "Caminito y Magallanes", -34.6393, -58.3626, [h(TODOS, "10:00", "18:00")], 0, 4.4, 15840, ["caminito", "caminito-2", "tango"], {
    es: "Las casas de chapa pintadas de colores que levantaron los inmigrantes del puerto. Mejor de día, y volviendo antes de que caiga el sol.",
    en: "Colourful tin houses built by the port's immigrants. Best by day, heading back before sunset.",
    pt: "As casas de chapa coloridas que os imigrantes do porto levantaram. Melhor de dia, voltando antes do pôr do sol.",
  }, "Colectivos 29, 64 o 152 hasta Vuelta de Rocha", ["Gratis", "Fotos", "Tango en la calle"], 2),
  S("recoleta", "Cementerio de la Recoleta", "atraccion", "norte-caba", "Recoleta", "Junín 1760", -34.5875, -58.3934, [h(TODOS, "09:00", "17:00")], 1, 4.7, 12960, ["recoleta", "recoleta-2", "jacarandas"], {
    es: "Un barrio de mármol con bóvedas, ángeles y calles propias. La tumba de Eva Perón está a pocos pasos de la entrada principal.",
    en: "A marble neighbourhood of vaults, angels and its own little streets. Eva Perón's tomb is a short walk from the main gate.",
  }, "Colectivos 17, 61, 67 o 92 hasta Plaza Francia", ["Visita guiada", "Fotos"], 12),
  S("puente-mujer", "Puente de la Mujer", "atraccion", "centro", "Puerto Madero", "Dique 3, Puerto Madero", -34.608, -58.3653, null, 0, 4.5, 7410, ["puente-mujer", "puerto-madero", "skyline"], {
    es: "El puente blanco de Calatrava que gira para dejar pasar los barcos. Al atardecer los diques se tiñen de naranja.",
    en: "Calatrava's white bridge, which swings open for boats. At sunset the docks turn orange.",
    pt: "A ponte branca de Calatrava, que gira para os barcos passarem. No fim da tarde as docas ficam laranja.",
  }, "Subte B, estación L. N. Alem, y 8 cuadras a pie", ["Gratis", "Atardecer", "Accesible"], 20),
  S("feria-san-telmo", "Feria de San Telmo", "ferias", "sur-caba", "San Telmo", "Defensa y Humberto Primo", -34.6205, -58.3713, [h([0], "10:00", "17:00")], 0, 4.6, 8870, ["san-telmo", "san-telmo-2", "tango"], {
    es: "Los domingos la calle Defensa se llena de puestos de antigüedades, sifones, discos y tango improvisado en Plaza Dorrego.",
    en: "On Sundays, Defensa street fills with antiques, soda siphons, records and impromptu tango in Plaza Dorrego.",
    pt: "Aos domingos a rua Defensa se enche de antiguidades, sifões, discos e tango improvisado na Plaza Dorrego.",
  }, "Subte C, estación Independencia, y 6 cuadras a pie", ["Solo domingos", "Gratis", "Tango en la calle"], 1),
  S("plaza-de-mayo", "Plaza de Mayo y Casa Rosada", "atraccion", "centro", "Monserrat", "Balcarce 50", -34.6081, -58.3703, null, 0, 4.5, 11230, ["casa-rosada", "casa-rosada-2", "obelisco"], {
    es: "La plaza donde pasó buena parte de la historia argentina, con la Casa Rosada de un lado y el Cabildo del otro.",
    en: "The square where much of Argentine history happened, with the Casa Rosada on one side and the Cabildo on the other.",
  }, "Subte A, estación Plaza de Mayo", ["Gratis", "Historia"], 9),
  S("congreso", "Palacio del Congreso", "atraccion", "centro", "Balvanera", "Hipólito Yrigoyen 1849", -34.6096, -58.3925, [h([1, 2, 3, 4, 5], "11:00", "17:00")], 0, 4.6, 5610, ["congreso", "congreso-2", "avenida-noche"], {
    es: "La cúpula verde que cierra la Avenida de Mayo. Hay visitas guiadas gratuitas entre semana con cupo limitado.",
    pt: "A cúpula verde que fecha a Avenida de Mayo. Há visitas guiadas gratuitas durante a semana, com vagas limitadas.",
  }, "Subte A, estación Congreso", ["Visita guiada", "Gratis"], 33),
  S("floralis", "Floralis Genérica", "atraccion", "norte-caba", "Recoleta", "Av. Figueroa Alcorta 2301", -34.5816, -58.3932, null, 0, 4.6, 6330, ["floralis", "jacarandas-2", "recoleta"], {
    es: "La flor de acero que abre sus pétalos de día y los cierra al anochecer, en medio de la plaza de las Naciones Unidas.",
    en: "The steel flower that opens its petals by day and closes them at dusk, in the middle of United Nations square.",
    pt: "A flor de aço que abre as pétalas de dia e fecha ao anoitecer, no meio da praça das Nações Unidas.",
  }, "Colectivos 67 o 130 por Av. Figueroa Alcorta", ["Gratis", "Fotos", "Accesible"], 40),
  S("ateneo", "El Ateneo Grand Splendid", "cultura", "norte-caba", "Recoleta", "Av. Santa Fe 1860", -34.596, -58.3943, [h(TODOS, "09:00", "22:00")], 0, 4.8, 10120, ["ateneo", "ateneo-2", "cafe"], {
    es: "Un teatro de 1919 convertido en librería: los palcos son salas de lectura y en el escenario hay un café.",
    en: "A 1919 theatre turned into a bookshop: the boxes are reading rooms and the stage is a café.",
    pt: "Um teatro de 1919 que virou livraria: os camarotes são salas de leitura e no palco funciona um café.",
  }, "Subte D, estación Callao", ["Ideal con lluvia", "Gratis", "Accesible"], 4),
  S("malba", "MALBA", "cultura", "norte-caba", "Palermo", "Av. Figueroa Alcorta 3415", -34.5771, -58.4036, [h(MIE_DOM, "12:00", "20:00")], 2, 4.7, 7820, ["museo", "museo-2", "jacarandas-2"], {
    es: "Arte latinoamericano moderno, con Frida Kahlo, Tarsila do Amaral y Xul Solar en la colección permanente. Los miércoles la entrada es más barata.",
    en: "Modern Latin American art, with Frida Kahlo, Tarsila do Amaral and Xul Solar in the permanent collection.",
    pt: "Arte latino-americana moderna, com Frida Kahlo, Tarsila do Amaral e Xul Solar no acervo permanente.",
  }, "Colectivos 67, 102 o 130 por Av. Figueroa Alcorta", ["Ideal con lluvia", "Accesible"], 18),
  S("bellas-artes", "Museo Nacional de Bellas Artes", "cultura", "norte-caba", "Recoleta", "Av. del Libertador 1473", -34.5839, -58.3929, [h(MAR_DOM, "11:00", "19:30")], 0, 4.7, 8420, ["museo-2", "museo", "recoleta"], {
    es: "Entrada gratuita y una colección enorme de arte argentino y europeo. Se recorre bien en dos horas.",
    en: "Free entry and a huge collection of Argentine and European art. Two hours is a good visit.",
  }, "Colectivos 17, 62 o 93 por Av. del Libertador", ["Gratis", "Ideal con lluvia", "Accesible"], 26),
  S("rosedal", "Rosedal de Palermo", "naturaleza", "norte-caba", "Palermo", "Av. Infanta Isabel 410", -34.5714, -58.4176, [h(TODOS, "08:00", "20:00")], 0, 4.7, 9930, ["rosedal", "lago", "jacarandas"], {
    es: "Más de dieciocho mil rosales alrededor del lago de los Bosques de Palermo. En primavera está en su mejor momento.",
    en: "Over eighteen thousand rose bushes around the Palermo Woods lake, at their best in spring.",
    pt: "Mais de dezoito mil roseiras em volta do lago dos Bosques de Palermo. Na primavera está no auge.",
  }, "Subte D, estación Plaza Italia, y 15 minutos a pie", ["Gratis", "Al aire libre", "Con chicos"], 7),
  S("jardin-japones", "Jardín Japonés", "naturaleza", "norte-caba", "Palermo", "Av. Casares 2966", -34.5786, -58.41, [h(TODOS, "10:00", "18:45")], 1, 4.6, 7240, ["jardin-japones", "rosedal", "lago"], {
    es: "Puentes rojos, carpas en el estanque y una casa de té. Un rato de calma a dos cuadras de la avenida.",
    pt: "Pontes vermelhas, carpas no lago e uma casa de chá. Um respiro a duas quadras da avenida.",
  }, "Subte D, estación Plaza Italia, y 10 minutos a pie", ["Al aire libre", "Con chicos"], 14),
  S("reserva", "Reserva Ecológica Costanera Sur", "naturaleza", "centro", "Puerto Madero", "Av. Tristán Achával Rodríguez 1550", -34.6145, -58.3525, [h(MAR_DOM, "08:00", "18:00")], 0, 4.6, 6880, ["reserva", "rio", "atardecer"], {
    es: "Senderos de tierra entre lagunas y el río, a quince minutos del centro. Se puede recorrer a pie o en bicicleta.",
    en: "Dirt trails between lagoons and the river, fifteen minutes from downtown. Walk it or ride it.",
    pt: "Trilhas de terra entre lagoas e o rio, a quinze minutos do centro. Dá para fazer a pé ou de bicicleta.",
  }, "Colectivos 2 o 4 hasta Costanera Sur", ["Gratis", "Al aire libre", "Bici"], 22),
  S("usina", "Usina del Arte", "cultura", "sur-caba", "La Boca", "Agustín R. Caffarena 1", -34.6286, -58.3567, [h(MIE_DOM, "14:00", "20:00")], 0, 4.6, 3940, ["usina", "concierto", "caminito"], {
    es: "Una vieja usina eléctrica convertida en sala de conciertos y muestras. Muchas funciones son gratuitas con reserva.",
    en: "An old power station turned concert hall and gallery. Many shows are free with a booking.",
  }, "Colectivos 29, 64 o 152 hasta Pedro de Mendoza", ["Gratis", "Música"], 11),
  S("bombonera", "La Bombonera", "atraccion", "sur-caba", "La Boca", "Brandsen 805", -34.6356, -58.3647, [h(TODOS, "10:00", "18:00")], 2, 4.7, 11780, ["bombonera", "bombonera-2", "caminito"], {
    es: "El estadio de Boca Juniors y su museo. Los días de partido el barrio entero cambia de ritmo.",
    en: "Boca Juniors' stadium and museum. On match days the whole neighbourhood changes pace.",
    pt: "O estádio do Boca Juniors e seu museu. Em dia de jogo o bairro inteiro muda de ritmo.",
  }, "Colectivos 29, 64 o 152 hasta Brandsen", ["Fútbol", "Visita guiada"], 5),
  S("barrio-chino", "Barrio Chino de Belgrano", "gastronomia", "norte-caba", "Belgrano", "Arribeños y Juramento", -34.56, -58.4521, [h(TODOS, "10:00", "20:00")], 1, 4.4, 5210, ["calle", "empanadas-2", "street-art"], {
    es: "Cuatro cuadras de almacenes, puestos de comida y templos. Los fines de semana se camina de costado.",
    en: "Four blocks of grocers, food stalls and temples. At weekends it is shoulder to shoulder.",
  }, "Tren Mitre, estación Belgrano C", ["Comida al paso", "Fin de semana"], 30),
  S("puerto-frutos", "Puerto de Frutos", "ferias", "zona-norte", "Tigre", "Sarmiento 160, Tigre", -34.4165, -58.5815, [h(TODOS, "10:00", "18:00")], 0, 4.5, 8740, ["tigre", "kayak", "delta"], {
    es: "El mercado de mimbre, muebles y plantas a orillas del río Luján, donde antes llegaba la fruta de las islas.",
    en: "The wicker, furniture and plant market on the Luján river, where island fruit once landed.",
    pt: "O mercado de vime, móveis e plantas à beira do rio Luján, onde antes chegavam as frutas das ilhas.",
  }, "Tren Mitre, ramal Tigre, hasta la estación Tigre", ["Al aire libre", "Compras"], 8),
  S("delta", "Lanchas al Delta", "naturaleza", "zona-norte", "Tigre", "Estación Fluvial, Mitre 305, Tigre", -34.4202, -58.5797, [h(TODOS, "08:00", "19:00")], 2, 4.7, 6150, ["delta", "kayak", "tigre"], {
    es: "Desde la Estación Fluvial salen las lanchas colectivas que recorren los canales del delta, entre casas sobre pilotes y muelles de madera.",
    en: "Water buses leave the river station to wind through the delta's canals, past stilt houses and wooden piers.",
    pt: "Da Estação Fluvial saem as lanchas que percorrem os canais do delta, entre casas sobre palafitas e píeres de madeira.",
  }, "Tren Mitre, ramal Tigre, y 5 minutos a pie", ["Al aire libre", "Día completo"], 16),
  S("bajo-san-isidro", "Bajo de San Isidro", "naturaleza", "zona-norte", "San Isidro", "Paseo de la Costa, San Isidro", -34.4685, -58.5065, null, 0, 4.6, 3120, ["atardecer", "rio", "kayak"], {
    es: "La costa al pie de la barranca, con clubes de remo, cafés y la catedral asomando arriba. Al atardecer el río se pone dorado.",
    en: "The riverfront below the bluff, with rowing clubs, cafés and the cathedral peeking above. At sunset the river turns gold.",
  }, "Tren de la Costa, estación San Isidro R", ["Gratis", "Al aire libre", "Atardecer"], 52),
  S("paseo-costa-vl", "Paseo de la Costa, Vicente López", "naturaleza", "zona-norte", "Vicente López", "Av. Rafael Obligado y Paraná", -34.523, -58.4705, null, 0, 4.5, 3860, ["atardecer", "rio", "reserva"], {
    es: "Kilómetros de costa con césped, bicisenda y mates al atardecer. Los vecinos lo llenan los domingos.",
    pt: "Quilômetros de orla com gramado, ciclovia e chimarrão no fim da tarde. Os moradores lotam aos domingos.",
  }, "Colectivo 15 o tren Mitre a Vicente López", ["Gratis", "Al aire libre", "Bici"], 19),
  S("feria-mataderos", "Feria de Mataderos", "ferias", "oeste-caba", "Mataderos", "Av. Lisandro de la Torre y Av. de los Corrales", -34.6588, -58.5017, [h([0], "11:00", "19:00")], 0, 4.5, 4560, ["gauchos", "feria", "empanadas"], {
    es: "Los domingos hay destrezas criollas, chamamé y locro en las esquinas. El lado más campero de la ciudad.",
    en: "On Sundays there are gaucho skills, chamamé music and locro stew on the corners. The city's countryside side.",
    pt: "Aos domingos tem habilidades gaúchas, chamamé e locro nas esquinas. O lado mais campeiro da cidade.",
  }, "Colectivos por Av. Juan B. Alberdi hasta Lisandro de la Torre", ["Solo domingos", "Gratis", "Folklore"], 27),
  S("ribera-quilmes", "Ribera de Quilmes", "naturaleza", "zona-sur", "Quilmes", "Av. Cervantes y Otamendi, Quilmes", -34.714, -58.249, null, 0, 4.3, 2980, ["rio", "atardecer", "cerveza"], {
    es: "La costanera del sur, con paradores, pescadores y el río abierto hasta el horizonte.",
    pt: "A orla do sul, com quiosques, pescadores e o rio aberto até o horizonte.",
  }, "Tren Roca hasta Quilmes y colectivo a la ribera", ["Gratis", "Al aire libre", "Atardecer"], 63),
  S("calle-corrientes", "Teatros de la calle Corrientes", "cultura", "centro", "San Nicolás", "Av. Corrientes 800 a 1500", -34.604, -58.388, [h(TODOS, "18:00", "01:00")], 2, 4.6, 6710, ["avenida-noche", "teatro-colon-2", "pizza"], {
    es: "La calle que no duerme: teatros, librerías de saldos y pizzerías abiertas después de la función.",
    en: "The street that never sleeps: theatres, bargain bookshops and pizzerias open after the show.",
    pt: "A rua que não dorme: teatros, sebos e pizzarias abertas depois do espetáculo.",
  }, "Subte B, estaciones Uruguay o Carlos Pellegrini", ["Ideal de noche", "Teatro"], 10),
  S("planetario", "Planetario Galileo Galilei", "cultura", "norte-caba", "Palermo", "Av. Sarmiento y Belisario Roldán", -34.5696, -58.4116, [h(MAR_DOM, "13:00", "20:00")], 1, 4.6, 5320, ["lago", "rosedal", "jacarandas"], {
    es: "La esfera de los Bosques de Palermo, con funciones bajo la cúpula y meteoritos de verdad en la entrada.",
    en: "The sphere in Palermo Woods, with dome shows and real meteorites at the entrance.",
  }, "Subte D, estación Plaza Italia, y 10 minutos a pie", ["Con chicos", "Ideal con lluvia"], 36),
  S("museo-evita", "Museo Evita", "cultura", "norte-caba", "Palermo", "Lafinur 2988", -34.5774, -58.4185, [h(MAR_DOM, "11:00", "19:00")], 1, 4.6, 2840, ["museo-2", "museo", "jacarandas"], {
    es: "Vestidos, fotos y discursos de Eva Perón en una casona de Palermo Chico, con un patio para el café de después.",
    pt: "Vestidos, fotos e discursos de Eva Perón em um casarão de Palermo Chico, com um pátio para o café depois.",
  }, "Subte D, estación Plaza Italia", ["Historia", "Ideal con lluvia"], 58),
  S("mercado-san-telmo", "Mercado de San Telmo", "gastronomia", "sur-caba", "San Telmo", "Bolívar 970", -34.6197, -58.3717, [h(TODOS, "10:00", "20:00")], 1, 4.5, 7690, ["mercado", "san-telmo", "empanadas"], {
    es: "Un mercado de 1897 con estructura de hierro, verdulerías de siempre y barras nuevas de café y sándwiches.",
    en: "An 1897 iron market with old-school greengrocers and new coffee and sandwich counters.",
    pt: "Um mercado de 1897 com estrutura de ferro, quitandas de sempre e balcões novos de café e sanduíches.",
  }, "Subte C, estación Independencia", ["Comida al paso", "Ideal con lluvia"], 6),
  S("museo-mate", "Museo del Mate", "cultura", "zona-norte", "Tigre", "Lavalle 289, Tigre", -34.4172, -58.577, [h(MIE_DOM, "11:00", "18:00")], 1, 4.5, 1640, ["mate", "tigre", "delta"], {
    es: "Cientos de mates, bombillas y pavas que cuentan cómo se volvió costumbre la infusión más compartida del país.",
  }, "Tren Mitre, ramal Tigre, y 8 minutos a pie", ["Curioso", "Ideal con lluvia"], 81),
  S("mercado-pulgas", "Mercado de Pulgas", "ferias", "norte-caba", "Colegiales", "Av. Álvarez Thomas y Dorrego", -34.5803, -58.4458, [h(MAR_DOM, "10:00", "19:00")], 1, 4.4, 2310, ["san-telmo", "street-art", "calle"], {
    es: "Galpón de muebles antiguos, lámparas y objetos rescatados. Se regatea con educación.",
    pt: "Galpão de móveis antigos, luminárias e objetos garimpados. Pechinchar com educação é parte do passeio.",
  }, "Subte B, estación Dorrego, y 10 minutos a pie", ["Compras", "Curioso"], 95),
  S("tranquera", "Parrilla La Tranquera", "gastronomia", "norte-caba", "Palermo", "Gorriti 4850", -34.588, -58.43, [h(TODOS, "12:00", "16:00"), h(TODOS, "20:00", "00:30")], 2, 4.7, 3410, ["parrilla", "parrilla-2", "vino"], {
    es: "Vacío, mollejas y provoleta a la leña. Los sábados a la noche conviene reservar o llegar antes de las nueve.",
    en: "Flank steak, sweetbreads and grilled provolone over wood. On Saturday nights book or arrive before nine.",
    pt: "Vazio, mollejas e provoleta na lenha. Sábado à noite vale reservar ou chegar antes das nove.",
  }, "Subte D, estación Scalabrini Ortiz", ["Reserva recomendada", "Vinos"], 4),
  S("farolito", "Bodegón El Farolito", "gastronomia", "sur-caba", "Boedo", "Av. Boedo 902", -34.63, -58.417, [h(LUN_SAB, "12:00", "15:30"), h(LUN_SAB, "20:00", "00:00")], 1, 4.6, 2190, ["vino", "empanadas-2", "parrilla-2"], {
    es: "Milanesas que no entran en el plato, sifón en la mesa y mozos de toda la vida. Las porciones alcanzan para dos.",
    en: "Milanesas bigger than the plate, a soda siphon on the table and career waiters. Portions feed two.",
  }, "Subte E, estación Boedo", ["Porciones grandes", "Clásico"], 15),
  S("al-molde", "Pizzería Corrientes al Molde", "gastronomia", "centro", "San Nicolás", "Av. Corrientes 1380", -34.6035, -58.3905, [h(TODOS, "11:30", "02:00")], 1, 4.5, 6120, ["pizza", "noche-2", "avenida-noche"], {
    es: "Muzzarella al molde, fainá y moscato, de parado en la barra como manda la tradición de la calle Corrientes.",
    en: "Deep-pan mozzarella pizza, fainá and moscato, standing at the counter as Corrientes tradition demands.",
    pt: "Pizza de muçarela de forma, fainá e moscato, em pé no balcão como manda a tradição da Corrientes.",
  }, "Subte B, estación Uruguay", ["Abierto tarde", "Clásico"], 3),
  S("cafe-inmigrantes", "Café de los Inmigrantes", "gastronomia", "centro", "Monserrat", "Av. de Mayo 825", -34.609, -58.38, [h(TODOS, "08:00", "23:00")], 1, 4.4, 4870, ["cafe", "medialunas", "avenida-noche"], {
    es: "Café notable con mesas de mármol, medialunas recién hechas y jazz los jueves a la noche.",
    en: "A historic café with marble tables, fresh medialunas and jazz on Thursday nights.",
    pt: "Café histórico com mesas de mármore, medialunas fresquinhas e jazz às quintas à noite.",
  }, "Subte A, estación Piedras", ["Desayuno", "Música"], 9),
  S("heladeria-rosedal", "Heladería del Rosedal", "gastronomia", "norte-caba", "Palermo", "Av. Sarmiento 2601", -34.572, -58.42, [h(TODOS, "11:00", "23:30")], 1, 4.6, 1980, ["helado", "rosedal", "lago"], {
    es: "Dulce de leche granizado y sambayón para llevar al lago. En verano la fila llega a la esquina.",
    pt: "Doce de leite granizado e zabaione para levar ao lago. No verão a fila chega à esquina.",
  }, "Subte D, estación Plaza Italia", ["Postre", "Con chicos"], 21),
  S("salteña", "Empanadas La Salteña", "gastronomia", "sur-caba", "San Telmo", "Chacabuco 902", -34.6215, -58.373, [h(MAR_DOM, "11:00", "23:00")], 1, 4.5, 2640, ["empanadas", "empanadas-2", "san-telmo"], {
    es: "Empanadas salteñas al horno de barro, cortadas a cuchillo, y locro los domingos de invierno.",
    en: "Salta-style empanadas from a clay oven, knife-cut filling, and locro on winter Sundays.",
  }, "Subte C, estación Independencia", ["Comida al paso", "Económico"], 12),
  S("cerveceria-muelle", "Cervecería del Muelle", "gastronomia", "zona-sur", "Quilmes", "Av. Cervantes 1200, Quilmes", -34.7155, -58.251, [h(MIE_DOM, "17:00", "01:00")], 1, 4.4, 1240, ["cerveza", "rio", "atardecer"], {
    es: "Diez canillas de cerveza local frente al río, con papas rústicas y música en vivo los viernes.",
    pt: "Dez torneiras de cerveja local de frente para o rio, com batatas rústicas e música ao vivo às sextas.",
  }, "Tren Roca hasta Quilmes y colectivo a la ribera", ["Música", "Atardecer"], 88),
  S("don-fermin", "Parrilla Don Fermín", "gastronomia", "oeste-caba", "Mataderos", "Av. de los Corrales 6800", -34.658, -58.504, [h([0, 5, 6], "12:00", "17:00")], 1, 4.6, 980, ["parrilla-2", "gauchos", "vino"], {
    es: "Asado de tira y morcilla en la cuadra de la feria. El domingo se come con chamamé de fondo.",
  }, "Colectivos por Av. Juan B. Alberdi hasta Lisandro de la Torre", ["Clásico", "Fin de semana"], 120),
  S("isleña", "Recreo La Isleña", "gastronomia", "zona-norte", "Delta de Tigre", "Río Sarmiento, muelle 214", -34.395, -58.56, [h([0, 5, 6], "12:00", "18:00")], 2, 4.5, 860, ["delta", "parrilla", "kayak"], {
    es: "Un recreo de isla con muelle propio: se llega en lancha colectiva y se almuerza con los pies cerca del agua.",
    en: "An island retreat with its own pier: arrive by water bus and lunch right by the water.",
    pt: "Um recanto na ilha com píer próprio: chega-se de lancha e almoça-se com os pés perto da água.",
  }, "Lancha colectiva desde la Estación Fluvial de Tigre, 40 minutos", ["Día completo", "Al aire libre"], 34),
  S("club-lanus", "Bodegón del Club Lanús", "gastronomia", "zona-sur", "Lanús", "Av. Hipólito Yrigoyen 3900, Lanús", -34.705, -58.392, [h(LUN_SAB, "20:00", "00:30")], 1, 4.5, 740, ["empanadas", "vino", "pizza"], {
    es: "El comedor del club de barrio, con la mesa larga de los sábados y la mejor tortilla de la zona sur.",
  }, "Tren Roca, estación Lanús", ["Porciones grandes", "Económico"], 140),
  S("hotel-dorrego", "Hotel Plaza Dorrego", "alojamiento", "sur-caba", "San Telmo", "Humberto Primo 420", -34.621, -58.372, null, 2, 4.6, 1320, ["hotel-habitacion", "hotel-lobby", "san-telmo"], {
    es: "Casona restaurada de 1890 con doce habitaciones y patio con aljibe, a media cuadra de la plaza.",
    en: "A restored 1890 townhouse with twelve rooms and a courtyard well, half a block from the square.",
    pt: "Casarão restaurado de 1890 com doze quartos e pátio com cisterna, a meia quadra da praça.",
  }, "Subte C, estación Independencia", ["Desayuno incluido", "Wifi"], 6),
  S("palermo-suites", "Palermo Soho Suites", "alojamiento", "norte-caba", "Palermo", "Honduras 4900", -34.589, -58.432, null, 3, 4.7, 2210, ["hotel-habitacion-2", "hotel-lobby", "street-art"], {
    es: "Departamentos con cocina y balcón en el corazón de Palermo Soho, ideales para estadías de una semana.",
    en: "Apartments with kitchen and balcony in the heart of Palermo Soho, ideal for a week's stay.",
    pt: "Apartamentos com cozinha e varanda no coração de Palermo Soho, ideais para uma semana.",
  }, "Subte D, estación Plaza Italia", ["Cocina", "Wifi", "Balcón"], 10),
  S("hostel-mayo", "Hostel Avenida de Mayo", "alojamiento", "centro", "Monserrat", "Av. de Mayo 1180", -34.609, -58.383, null, 1, 4.4, 3460, ["hostel", "hotel-habitacion", "cafe"], {
    es: "Habitaciones compartidas y privadas en un edificio de 1910, con terraza y asado los viernes.",
    en: "Dorms and private rooms in a 1910 building, with a roof terrace and a Friday barbecue.",
    pt: "Quartos compartilhados e privativos num prédio de 1910, com terraço e churrasco às sextas.",
  }, "Subte A, estación Lima", ["Económico", "Terraza"], 17),
  S("recoleta-grand", "Recoleta Grand Hotel", "alojamiento", "norte-caba", "Recoleta", "Av. Callao 1750", -34.589, -58.39, null, 3, 4.8, 1890, ["hotel-lobby", "hotel-habitacion", "recoleta"], {
    es: "Hotel clásico de Recoleta con spa, a tres cuadras del cementerio y del paseo de Plaza Francia.",
    en: "A classic Recoleta hotel with a spa, three blocks from the cemetery and Plaza Francia.",
  }, "Colectivos 10, 37 o 59 por Av. Callao", ["Spa", "Accesible"], 29),
  S("ezeiza-inn", "Hotel Aeropuerto Inn", "alojamiento", "zona-sur", "Ezeiza", "Autopista Riccheri km 32, Ezeiza", -34.81, -58.53, null, 2, 4.2, 2760, ["hotel-habitacion-2", "aeropuerto", "hotel-lobby"], {
    es: "Para quien aterriza de madrugada o sale temprano: traslado gratuito a la terminal cada media hora.",
    en: "For red-eye arrivals or early departures: free shuttle to the terminal every half hour.",
    pt: "Para quem pousa de madrugada ou sai cedo: traslado gratuito ao terminal a cada meia hora.",
  }, "Traslado del hotel desde la Terminal A", ["Traslado incluido", "24 horas"], 8),
  S("posada-rio", "Posada del Río", "alojamiento", "zona-norte", "Tigre", "Paseo Victorica 470, Tigre", -34.422, -58.58, null, 2, 4.6, 940, ["hotel-habitacion", "kayak", "rio"], {
    es: "Seis habitaciones frente al río Luján y desayuno en la galería mirando pasar los botes de remo.",
    pt: "Seis quartos de frente para o rio Luján e café da manhã na varanda vendo os barcos a remo passarem.",
  }, "Tren Mitre, ramal Tigre, y 12 minutos a pie", ["Desayuno incluido", "Vista al río"], 47),
  S("madero-lofts", "Puerto Madero Lofts", "alojamiento", "centro", "Puerto Madero", "Juana Manso 1100", -34.611, -58.363, null, 3, 4.6, 1510, ["hotel-habitacion-2", "puerto-madero", "skyline"], {
    es: "Lofts sobre los diques con vista al río, gimnasio y estacionamiento. A diez minutos a pie del Puente de la Mujer.",
    en: "Dockside lofts with river views, gym and parking. Ten minutes on foot from the Puente de la Mujer.",
  }, "Subte B, estación L. N. Alem", ["Vista al río", "Estacionamiento"], 24),
  S("casa-belgrano", "Casa Belgrano B&B", "alojamiento", "norte-caba", "Belgrano", "Echeverría 2200", -34.562, -58.456, null, 2, 4.7, 620, ["hotel-habitacion", "jacarandas", "cafe"], {
    es: "Bed and breakfast en una casa con jardín y jacarandás en la vereda, a cuadras del Barrio Chino.",
  }, "Subte D, estación Juramento", ["Desayuno incluido", "Jardín"], 102, "borrador"),
];

export const DIA = 86400000;

export function crearLugares(hoy: Date): Lugar[] {
  return SEMILLAS.map(({ verificadoHace, estado, ...l }) => ({
    ...l,
    estado: estado ?? "publicado",
    verificado: new Date(hoy.getTime() - verificadoHace * DIA).toISOString(),
  }));
}
