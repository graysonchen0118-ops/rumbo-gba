"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { damp, montar } from "./kit";
import { AEROPUERTOS, ANTENAS, AUTOPISTAS, CABA, COSTA, ISLAS, PARTIDOS, RIACHUELO, RUTA_LLEGADA, TIERRA, xz } from "./geo";
import type { Aeropuerto, Categoria, Lugar } from "@/lib/types";
import { CATEGORIAS, mulberry32 } from "@/lib/format";

export type ModoMapa = "escenario" | "app" | "hero" | "fondo";

export interface MapaProps {
  modo: ModoMapa;
  lugares: Lugar[];
  favoritos: string[];
  foco: string | null;
  fotoFoco?: string | null;
  sinDatos: boolean;
  ruta: Aeropuerto | null;
  destino?: { lat: number; lon: number } | null;
  recorrido?: string[] | null;
  cats?: Categoria[];
  pausado?: boolean;
  onPin?: (id: string) => void;
  /** fracción horizontal de la pantalla donde debe quedar el centro del mapa */
  centroX?: number;
}

const C = {
  tierra: 0xebe2cc,
  tierraOscura: 0xd9d1bc,
  caba: 0xf5f1e6,
  rio: 0x8fb2bf,
  isla: 0x9fbf8a,
  autopista: 0xe3c88f,
  pista: 0x9aa4aa,
  edificio: 0xfbf8f1,
  vidrio: 0x8fb7cc,
  ruta: 0xe0703f,
  acento: 0x1f6f94,
  antena: 0x6c7a82,
};

const v3 = (lat: number, lon: number, y = 0) => {
  const [x, z] = xz(lat, lon);
  return new THREE.Vector3(x, y, z);
};

function forma(puntos: [number, number][]) {
  const s = new THREE.Shape();
  puntos.forEach(([lat, lon], i) => {
    const [x, z] = xz(lat, lon);
    if (i === 0) s.moveTo(x, -z);
    else s.lineTo(x, -z);
  });
  return s;
}

function dentro(px: number, pz: number, poly: [number, number][]) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) ok = !ok;
  }
  return ok;
}

function texturaCalles() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f5f1e6";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "rgba(160,150,128,0.38)";
  g.lineWidth = 3;
  for (let i = 0; i <= 128; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 128);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(128, i);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.2, 1.2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function etiqueta(texto: string, alto: number, opts: { color?: string; peso?: number; mayus?: boolean } = {}) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const fam = getComputedStyle(document.body).fontFamily || "sans-serif";
  const tam = 56;
  const t = opts.mayus ? texto.toUpperCase() : texto;
  const fuente = `${opts.peso ?? 700} ${tam}px ${fam}`;
  g.font = fuente;
  const w = Math.ceil(g.measureText(t).width) + 40;
  const h = tam + 36;
  c.width = w;
  c.height = h;
  g.font = fuente;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  g.lineWidth = 12;
  g.strokeStyle = "rgba(250,248,242,0.92)";
  g.strokeText(t, w / 2, h / 2 + 2);
  g.fillStyle = opts.color ?? "#55636b";
  g.fillText(t, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  s.renderOrder = 10;
  s.scale.set((w / h) * alto, alto, 1);
  s.userData.base = s.scale.clone();
  return s;
}

function texturaAnillo() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 30, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,0)");
  r.addColorStop(0.75, "rgba(255,255,255,0.9)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function MapaGBA(props: MapaProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pr = useRef(props);
  pr.current = props;
  const cambioLugares = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const modo = pr.current.modo;
    const k = montar(mount, { dpr: modo === "escenario" || modo === "fondo" ? 1.25 : 1.5, suavizado: modo !== "fondo" });
    if (!k) return;
    const { scene, renderer, track, small, reduce } = k;
    if (modo === "fondo") renderer.setPixelRatio(1);
    const interactivo = modo === "app" || modo === "escenario";
    const fondoCss = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#f4f1ea";
    const colorFondo = new THREE.Color(fondoCss);
    scene.fog = new THREE.Fog(colorFondo, 55, modo === "hero" ? 110 : 170);

    const camera = new THREE.PerspectiveCamera(modo === "hero" ? 34 : 38, k.size().w / k.size().h, 0.5, 400);
    const ajustarVista = (w: number, h: number) => {
      camera.aspect = w / h;
      const cx = pr.current.centroX;
      if (cx !== undefined && w >= 1024) camera.setViewOffset(w, h, w / 2 - cx * w, 0, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    ajustarVista(k.size().w, k.size().h);
    k.onResize(ajustarVista);

    const hemi = new THREE.HemisphereLight(0xfffaf0, 0xc9c2ae, 1.55);
    scene.add(hemi);
    const sol = new THREE.DirectionalLight(0xfff4e0, 1.15);
    sol.position.set(-30, 60, 40);
    scene.add(sol);

    // agua y tierra
    const rio = new THREE.Mesh(track(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2)), track(new THREE.MeshLambertMaterial({ color: C.rio })));
    rio.position.y = -0.32;
    scene.add(rio);

    const tierraGeo = track(new THREE.ExtrudeGeometry(forma(TIERRA), { depth: 0.6, bevelEnabled: false }).rotateX(-Math.PI / 2));
    const tierraMat = track(new THREE.MeshLambertMaterial({ color: C.tierra }));
    const tierra = new THREE.Mesh(tierraGeo, tierraMat);
    tierra.position.y = -0.6;
    scene.add(tierra);

    const callesTex = track(texturaCalles());
    const cabaGeo = track(new THREE.ExtrudeGeometry(forma(CABA), { depth: 0.1, bevelEnabled: false }).rotateX(-Math.PI / 2));
    const cabaMat = track(new THREE.MeshLambertMaterial({ color: 0xffffff, map: callesTex }));
    const caba = new THREE.Mesh(cabaGeo, cabaMat);
    scene.add(caba);

    // borde de la costa, una línea de arena
    const costaCurva = new THREE.CatmullRomCurve3(COSTA.map(([a, b]) => v3(a, b, -0.05)));
    const costa = new THREE.Mesh(track(new THREE.TubeGeometry(costaCurva, 160, 0.16, 5, false)), track(new THREE.MeshLambertMaterial({ color: 0xd8c9a2 })));
    scene.add(costa);

    ISLAS.forEach((i) => {
      const m = new THREE.Mesh(track(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2)), track(new THREE.MeshLambertMaterial({ color: C.isla })));
      const p = v3(i.lat, i.lon, -0.24);
      m.position.copy(p);
      m.scale.set(i.rx, 1, i.rz);
      m.rotation.y = i.giro;
      scene.add(m);
    });

    const riachuelo = new THREE.Mesh(track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(RIACHUELO.map(([a, b]) => v3(a, b, 0.06))), 80, 0.14, 6, false)), track(new THREE.MeshLambertMaterial({ color: C.rio })));
    scene.add(riachuelo);

    const matAutopista = track(new THREE.MeshLambertMaterial({ color: C.autopista }));
    AUTOPISTAS.forEach((tramo) => {
      const curva = new THREE.CatmullRomCurve3(tramo.map(([a, b]) => v3(a, b, 0.13)));
      scene.add(new THREE.Mesh(track(new THREE.TubeGeometry(curva, 60, 0.07, 4, false)), matAutopista));
    });

    // edificios: densos en la Capital, más bajos y salteados en el conurbano
    const rnd = mulberry32(7);
    const cabaXZ = CABA.map(([a, b]) => xz(a, b));
    const tierraXZ = TIERRA.map(([a, b]) => xz(a, b));
    const nCaba = small ? 360 : 760;
    const nConurbano = small ? 160 : 340;
    const cajas = new THREE.InstancedMesh(track(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)), track(new THREE.MeshLambertMaterial({ color: 0xffffff })), nCaba + nConurbano);
    cajas.frustumCulled = false;
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    let n = 0;
    let intentos = 0;
    while (n < nCaba && intentos < 20000) {
      intentos++;
      const x = -14 + rnd() * 17;
      const z = -9 + rnd() * 21;
      if (!dentro(x, z, cabaXZ)) continue;
      const d = Math.hypot(x, z);
      if (rnd() < d / 18) continue;
      const alto = 0.05 + rnd() * (d < 2.5 ? 0.85 : d < 6 ? 0.36 : 0.16);
      const ancho = 0.1 + rnd() * 0.11;
      m4.compose(new THREE.Vector3(x, 0.1, z), new THREE.Quaternion(), new THREE.Vector3(ancho, alto, ancho * (0.8 + rnd() * 0.5)));
      cajas.setMatrixAt(n, m4);
      cajas.setColorAt(n, col.setHex(C.edificio).offsetHSL(0, 0, -rnd() * 0.06));
      n++;
    }
    intentos = 0;
    while (n < nCaba + nConurbano && intentos < 20000) {
      intentos++;
      const x = -30 + rnd() * 50;
      const z = -26 + rnd() * 50;
      if (!dentro(x, z, tierraXZ) || dentro(x, z, cabaXZ)) continue;
      const d = Math.hypot(x + 4, z - 4);
      if (rnd() < d / 22) continue;
      const alto = 0.04 + rnd() * 0.1;
      const ancho = 0.14 + rnd() * 0.14;
      m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(ancho, alto, ancho));
      cajas.setMatrixAt(n, m4);
      cajas.setColorAt(n, col.setHex(C.tierraOscura).offsetHSL(0, 0, rnd() * 0.08));
      n++;
    }
    cajas.count = n;
    scene.add(cajas);

    // Puerto Madero, Caminito y el Obelisco
    const vidrio = track(new THREE.MeshPhongMaterial({ color: C.vidrio, shininess: 80, specular: 0xffffff }));
    const torre = track(new THREE.BoxGeometry(0.22, 1, 0.22).translate(0, 0.5, 0));
    [[-34.6115, -58.3618, 1.9], [-34.6135, -58.3612, 1.6], [-34.6095, -58.3605, 1.4], [-34.6155, -58.3622, 1.2], [-34.607, -58.3628, 1.1], [-34.6175, -58.3608, 1.5]].forEach(([a, b, h]) => {
      const t = new THREE.Mesh(torre, vidrio);
      t.position.copy(v3(a, b, 0.1));
      t.scale.y = h;
      scene.add(t);
    });
    const coloresBoca = [0xd9473f, 0xf2c14e, 0x2f78b7, 0x4f9d5a, 0xe9853d, 0x7b4fa1];
    const casita = track(new THREE.BoxGeometry(0.09, 0.12, 0.07).translate(0, 0.06, 0));
    coloresBoca.forEach((c, i) => {
      const m = new THREE.Mesh(casita, track(new THREE.MeshLambertMaterial({ color: c })));
      m.position.copy(v3(-34.6393 + (i % 3) * 0.0012, -58.3632 + Math.floor(i / 3) * 0.0016, 0.1));
      scene.add(m);
    });
    const obelisco = new THREE.Group();
    const blanco = track(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    const fuste = new THREE.Mesh(track(new THREE.CylinderGeometry(0.06, 0.11, 1.9, 4, 1).rotateY(Math.PI / 4).translate(0, 0.95, 0)), blanco);
    const punta = new THREE.Mesh(track(new THREE.ConeGeometry(0.0425, 0.14, 4).rotateY(Math.PI / 4).translate(0, 1.97, 0)), blanco);
    obelisco.add(fuste, punta);
    obelisco.position.y = 0.1;
    scene.add(obelisco);

    // aeropuertos
    const matPista = track(new THREE.MeshLambertMaterial({ color: C.pista }));
    (Object.keys(AEROPUERTOS) as Aeropuerto[]).forEach((a) => {
      const ap = AEROPUERTOS[a];
      const g = new THREE.Group();
      const largo = a === "eze" ? 3.3 : 2.1;
      const pista = new THREE.Mesh(track(new THREE.BoxGeometry(largo, 0.02, 0.09)), matPista);
      g.add(pista);
      if (a === "eze") {
        const p2 = new THREE.Mesh(track(new THREE.BoxGeometry(2.6, 0.02, 0.08)), matPista);
        p2.rotation.y = 1.15;
        p2.position.set(0.4, 0, 0.7);
        g.add(p2);
      }
      const terminal = new THREE.Mesh(track(new THREE.BoxGeometry(0.6, 0.18, 0.25).translate(0, 0.09, 0)), track(new THREE.MeshLambertMaterial({ color: 0xdfe7ea })));
      terminal.position.set(0.2, 0, -0.45);
      g.add(terminal);
      g.position.copy(v3(ap.lat, ap.lon, a === "eze" ? 0.02 : 0.12));
      g.rotation.y = ap.giro;
      scene.add(g);
    });

    // avión que aterriza en Ezeiza
    const avion = new THREE.Group();
    const matAvion = track(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    const fus = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.05, 0.95, 8).rotateZ(Math.PI / 2)), matAvion);
    const ala = new THREE.Mesh(track(new THREE.BoxGeometry(0.16, 0.02, 0.86)), matAvion);
    const cola = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, 0.02, 0.3)), matAvion);
    cola.position.x = -0.4;
    const deriva = new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.18, 0.02)), track(new THREE.MeshLambertMaterial({ color: C.acento })));
    deriva.position.set(-0.42, 0.1, 0);
    avion.add(fus, ala, cola, deriva);
    avion.scale.setScalar(1.6);
    scene.add(avion);
    const eze = v3(AEROPUERTOS.eze.lat, AEROPUERTOS.eze.lon, 0.12);
    const dirPista = new THREE.Vector3(Math.cos(AEROPUERTOS.eze.giro), 0, -Math.sin(AEROPUERTOS.eze.giro));
    const aproximacion = new THREE.CatmullRomCurve3([
      eze.clone().addScaledVector(dirPista, -26).add(new THREE.Vector3(0, 9, 0)),
      eze.clone().addScaledVector(dirPista, -12).add(new THREE.Vector3(0, 3.5, 0)),
      eze.clone().addScaledVector(dirPista, -2).add(new THREE.Vector3(0, 0.4, 0)),
      eze.clone().addScaledVector(dirPista, 1.2).add(new THREE.Vector3(0, 0.12, 0)),
    ]);

    // antenas con su señal
    const sprAnillo = track(texturaAnillo());
    const antenas = ANTENAS.map(([a, b]) => {
      const g = new THREE.Group();
      const mastil = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.05, 1.1, 5).translate(0, 0.55, 0)), track(new THREE.MeshLambertMaterial({ color: C.antena })));
      const luz = new THREE.Mesh(track(new THREE.SphereGeometry(0.07, 10, 8)), track(new THREE.MeshBasicMaterial({ color: 0x3fb984 })));
      luz.position.y = 1.12;
      g.add(mastil, luz);
      const anillos = [0, 1].map(() => {
        const r = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), new THREE.MeshBasicMaterial({ map: sprAnillo, color: 0x3fb984, transparent: true, depthWrite: false, opacity: 0.6 }));
        r.position.y = 0.2;
        g.add(r);
        return r;
      });
      g.position.copy(v3(a, b, 0.1));
      scene.add(g);
      return { g, luz, anillos };
    });

    // ondas para las acciones del panel y de la app
    const ondas = Array.from({ length: 6 }, () => {
      const m = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), new THREE.MeshBasicMaterial({ map: sprAnillo, color: C.ruta, transparent: true, depthWrite: false, opacity: 0 }));
      m.visible = false;
      scene.add(m);
      return { m, t: 1 };
    });
    const onda = (lat: number, lon: number, color = C.ruta) => {
      const o = ondas.find((x) => x.t >= 1) ?? ondas[0];
      o.t = 0;
      o.m.visible = true;
      (o.m.material as THREE.MeshBasicMaterial).color.setHex(color);
      o.m.position.copy(v3(lat, lon, 0.25));
    };

    // etiquetas, cuando la tipografía ya está lista
    const etiquetas: THREE.Sprite[] = [];
    let vivo = true;
    document.fonts?.ready.then(() => {
      if (!vivo) return;
      PARTIDOS.forEach((p) => {
        const s = etiqueta(p.nombre, p.grande ? 1.05 : 0.7, { color: p.nombre.startsWith("Río") ? "#5f7d86" : p.grande ? "#3d4b52" : "#7a868c", peso: p.grande ? 800 : 700, mayus: true });
        s.position.copy(v3(p.lat, p.lon, p.grande ? 1.6 : 1.1));
        scene.add(s);
        etiquetas.push(s);
      });
      (Object.keys(AEROPUERTOS) as Aeropuerto[]).forEach((a) => {
        const s = etiqueta(a === "eze" ? "Aeropuerto de Ezeiza" : "Aeroparque", 0.72, { color: "#1f6f94", peso: 800 });
        const p = v3(AEROPUERTOS[a].lat, AEROPUERTOS[a].lon, 1.5);
        s.position.copy(a === "aep" ? p.add(new THREE.Vector3(-2.4, 0, -0.4)) : p);
        scene.add(s);
        etiquetas.push(s);
      });
    });

    // pines de los lugares
    const geoCabeza = track(new THREE.SphereGeometry(0.2, 16, 12));
    const geoPalo = track(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6).translate(0, 0.425, 0));
    const geoAro = track(new THREE.TorusGeometry(0.3, 0.045, 8, 28).rotateX(Math.PI / 2));
    const matPalo = track(new THREE.MeshLambertMaterial({ color: 0x55636b }));
    const matAro = track(new THREE.MeshBasicMaterial({ color: 0xe0703f }));
    const matCat = new Map<Categoria, THREE.MeshLambertMaterial>();
    (Object.keys(CATEGORIAS) as Categoria[]).forEach((c) => matCat.set(c, track(new THREE.MeshLambertMaterial({ color: CATEGORIAS[c].hex, emissive: CATEGORIAS[c].hex, emissiveIntensity: 0.18 }))));
    type Pin = { g: THREE.Group; cabeza: THREE.Mesh; aro: THREE.Mesh; id: string; cat: Categoria; caida: number; pop: number; brillo: number };
    const pines = new Map<string, Pin>();
    const grupoPines = new THREE.Group();
    scene.add(grupoPines);
    const porCaer = new Set<string>();

    const sincronizarPines = () => {
      const ls = pr.current.lugares;
      const ids = new Set(ls.map((l) => l.id));
      pines.forEach((p, id) => {
        if (!ids.has(id)) {
          grupoPines.remove(p.g);
          pines.delete(id);
        }
      });
      ls.forEach((l) => {
        let p = pines.get(l.id);
        if (!p) {
          const g = new THREE.Group();
          const cabeza = new THREE.Mesh(geoCabeza, matCat.get(l.categoria)!);
          cabeza.position.y = 0.95;
          cabeza.userData.id = l.id;
          const palo = new THREE.Mesh(geoPalo, matPalo);
          palo.userData.id = l.id;
          const aro = new THREE.Mesh(geoAro, matAro);
          aro.position.y = 0.95;
          aro.visible = false;
          g.add(palo, cabeza, aro);
          grupoPines.add(g);
          p = { g, cabeza, aro, id: l.id, cat: l.categoria, caida: porCaer.has(l.id) ? 1 : 0, pop: 0, brillo: 0 };
          porCaer.delete(l.id);
          pines.set(l.id, p);
        }
        p.g.position.copy(v3(l.lat, l.lon, 0.1));
        if (p.cat !== l.categoria) {
          p.cat = l.categoria;
          p.cabeza.material = matCat.get(l.categoria)!;
        }
      });
    };
    sincronizarPines();
    cambioLugares.current = sincronizarPines;

    // ruta de llegada y su viajero
    const matRuta = track(new THREE.MeshBasicMaterial({ color: C.ruta }));
    let rutaMesh: THREE.Mesh | null = null;
    let rutaCurva: THREE.CatmullRomCurve3 | null = null;
    let rutaClave = "";
    let rutaT = 0;
    const viajero = new THREE.Mesh(track(new THREE.SphereGeometry(0.2, 14, 10)), track(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    const halo = new THREE.Mesh(track(new THREE.PlaneGeometry(1.4, 1.4).rotateX(-Math.PI / 2)), new THREE.MeshBasicMaterial({ map: sprAnillo, color: C.ruta, transparent: true, depthWrite: false }));
    viajero.add(halo);
    viajero.visible = false;
    scene.add(viajero);
    const armarRuta = () => {
      const { ruta, destino } = pr.current;
      const clave = ruta ? `${ruta}:${destino?.lat ?? ""}:${destino?.lon ?? ""}` : "";
      if (clave === rutaClave) return;
      rutaClave = clave;
      if (rutaMesh) {
        scene.remove(rutaMesh);
        rutaMesh.geometry.dispose();
        rutaMesh = null;
      }
      rutaCurva = null;
      viajero.visible = false;
      if (!ruta) return;
      const pts = RUTA_LLEGADA[ruta].map(([a, b]) => v3(a, b, 0.32));
      if (destino) pts.push(v3(destino.lat, destino.lon, 0.32));
      rutaCurva = new THREE.CatmullRomCurve3(pts);
      rutaMesh = new THREE.Mesh(new THREE.TubeGeometry(rutaCurva, 120, 0.14, 6, false), matRuta);
      rutaMesh.geometry.setDrawRange(0, 0);
      scene.add(rutaMesh);
      rutaT = 0;
      viajero.visible = true;
    };

    // recorrido sugerido
    let recMesh: THREE.Mesh | null = null;
    let recClave = "";
    const marcas: THREE.Sprite[] = [];
    const matRec = track(new THREE.MeshBasicMaterial({ color: C.acento }));
    const armarRecorrido = () => {
      const ids = pr.current.recorrido ?? [];
      const clave = ids.join(",");
      if (clave === recClave) return;
      recClave = clave;
      if (recMesh) {
        scene.remove(recMesh);
        recMesh.geometry.dispose();
        recMesh = null;
      }
      marcas.forEach((m) => {
        scene.remove(m);
        m.material.map?.dispose();
        m.material.dispose();
      });
      marcas.length = 0;
      const pts = ids.map((id) => pr.current.lugares.find((l) => l.id === id)).filter(Boolean) as Lugar[];
      if (pts.length < 2) return;
      const curva = new THREE.CatmullRomCurve3(pts.map((l) => v3(l.lat, l.lon, 0.3)), false, "centripetal");
      recMesh = new THREE.Mesh(new THREE.TubeGeometry(curva, 100, 0.06, 5, false), matRec);
      scene.add(recMesh);
      pts.forEach((l, i) => {
        const s = etiqueta(String(i + 1), 0.5, { color: "#1f6f94", peso: 900 });
        s.position.copy(v3(l.lat, l.lon, 1.65));
        scene.add(s);
        marcas.push(s);
      });
    };

    // tarjeta con la foto del lugar en foco
    const cargador = new THREE.TextureLoader();
    cargador.setCrossOrigin("anonymous");
    const tarjeta = new THREE.Group();
    const marco = new THREE.Mesh(track(new THREE.PlaneGeometry(1.86, 1.36)), track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })));
    const foto = new THREE.Mesh(track(new THREE.PlaneGeometry(1.74, 1.24)), track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })));
    foto.position.z = 0.01;
    tarjeta.add(marco, foto);
    tarjeta.visible = false;
    scene.add(tarjeta);
    let fotoActual = "";
    let tarjetaT = 0;
    const cargarFoto = (url: string) => {
      if (url === fotoActual) return;
      fotoActual = url;
      tarjetaT = 0;
      cargador.load(url, (t) => {
        if (url !== fotoActual || !vivo) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        const mat = foto.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.map = t;
        mat.needsUpdate = true;
      });
    };

    // cámara
    const objetivo = new THREE.Vector3(-5, 0, 8);
    const meta = { x: -5, z: 8, d: 58, el: 0.95, az: 0 };
    const act = { x: -5, z: 8, d: 58, el: 0.95, az: 0 };
    let usuario = 0;
    const vistaGeneral = () => {
      if (modo === "hero") return { x: -2.5, z: 4, d: small ? 36 : 40, el: 0.78 };
      if (modo === "fondo") return { x: -4, z: 6, d: 62, el: 1.0 };
      if (modo === "app") return { x: -3, z: 3, d: 44, el: 0.98 };
      return { x: -6, z: 8, d: 56, el: 0.92 };
    };
    Object.assign(meta, vistaGeneral());
    Object.assign(act, meta);
    act.d = meta.d * 1.35;

    const puntero = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      puntero.x = (e.clientX / window.innerWidth - 0.5) * 2;
      puntero.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let scrollP = 0;
    const onScroll = (e: Event) => (scrollP = (e as CustomEvent<{ p: number }>).detail?.p ?? 0);
    window.addEventListener("rumbo:scroll", onScroll);
    const onPagina = () => {
      if (modo !== "fondo") return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollP = window.scrollY / max;
    };
    window.addEventListener("scroll", onPagina, { passive: true });

    const onOnda = (e: Event) => {
      const d = (e as CustomEvent<{ lat?: number; lon?: number }>).detail;
      if (d?.lat !== undefined && d.lon !== undefined) onda(d.lat, d.lon);
    };
    const onPinNuevo = (e: Event) => {
      const d = (e as CustomEvent<{ id: string; lat: number; lon: number }>).detail;
      if (!d) return;
      const p = pines.get(d.id);
      if (p) p.caida = 1;
      else porCaer.add(d.id);
      onda(d.lat, d.lon, C.acento);
    };
    const onFav = (e: Event) => {
      const d = (e as CustomEvent<{ id: string }>).detail;
      const p = d && pines.get(d.id);
      if (p) p.pop = 1;
    };
    const onTarifa = () => {
      onda(AEROPUERTOS.eze.lat, AEROPUERTOS.eze.lon);
      onda(AEROPUERTOS.aep.lat, AEROPUERTOS.aep.lon);
    };
    const onPaquete = () => ANTENAS.forEach(([a, b]) => onda(a, b, 0x3fb984));
    window.addEventListener("rumbo:pulso", onOnda);
    window.addEventListener("rumbo:pin", onPinNuevo);
    window.addEventListener("rumbo:favorito", onFav);
    window.addEventListener("rumbo:tarifa", onTarifa);
    window.addEventListener("rumbo:paquete", onPaquete);

    // gestos en el mapa de la app y del escenario
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const punteros = new Map<number, { x: number; y: number }>();
    let arrastre = 0;
    let pinch = 0;
    let hover: string | null = null;
    const canvas = renderer.domElement;
    if (modo === "app") canvas.style.touchAction = "none";
    const pick = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(grupoPines.children, true);
      const h = hits.find((x) => x.object.userData.id);
      return (h?.object.userData.id as string | undefined) ?? null;
    };
    const down = (e: PointerEvent) => {
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      arrastre = 0;
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
      if (modo === "app") canvas.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const prev = punteros.get(e.pointerId);
      if (!prev) {
        if (interactivo && e.pointerType === "mouse") {
          const id = pick(e.clientX, e.clientY);
          if (id !== hover) {
            hover = id;
            canvas.style.cursor = id ? "pointer" : modo === "app" ? "grab" : "default";
          }
        }
        return;
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      arrastre += Math.abs(dx) + Math.abs(dy);
      if (modo !== "app") return;
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) meta.d = THREE.MathUtils.clamp(meta.d * (pinch / dist), 6, 80);
        pinch = dist;
      } else {
        const esc = (act.d / Math.max(1, canvas.clientHeight)) * 1.15;
        const cosA = Math.cos(act.az);
        const sinA = Math.sin(act.az);
        meta.x -= (dx * cosA + dy * sinA) * esc;
        meta.z -= (-dx * sinA + dy * cosA) * esc;
      }
      usuario = 6;
    };
    const up = (e: PointerEvent) => {
      const eraUno = punteros.size === 1;
      punteros.delete(e.pointerId);
      pinch = 0;
      if (eraUno && arrastre < 8 && interactivo) {
        const id = pick(e.clientX, e.clientY);
        if (id) pr.current.onPin?.(id);
      }
    };
    const wheel = (e: WheelEvent) => {
      if (modo !== "app") return;
      e.preventDefault();
      meta.d = THREE.MathUtils.clamp(meta.d * Math.exp(e.deltaY * 0.0012), 6, 80);
      usuario = 6;
    };
    const zoom = (e: Event) => {
      const f = (e as CustomEvent<number>).detail;
      if (f === 0) {
        Object.assign(meta, vistaGeneral());
        usuario = 0;
      } else meta.d = THREE.MathUtils.clamp(meta.d * f, 6, 80);
    };
    if (interactivo) {
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("wheel", wheel, { passive: false });
      if (modo === "app") window.addEventListener("rumbo:zoom", zoom);
    }

    let focoPrevio: string | null = null;
    let rutaPrevia = "";
    let recPrevio = "";
    const tmp = new THREE.Vector3();
    const camQ = new THREE.Quaternion();

    k.loop((dt, t) => {
      const p = pr.current;
      if (p.pausado) return;
      armarRuta();
      armarRecorrido();

      // a dónde mira la cámara
      const foco = p.foco ? p.lugares.find((l) => l.id === p.foco) : null;
      const claveRuta = p.ruta ? rutaClave : "";
      const claveRec = (p.recorrido ?? []).join(",");
      if ((foco?.id ?? null) !== focoPrevio || claveRuta !== rutaPrevia || claveRec !== recPrevio) {
        focoPrevio = foco?.id ?? null;
        rutaPrevia = claveRuta;
        recPrevio = claveRec;
        usuario = 0;
        if (foco && modo !== "fondo" && modo !== "hero") {
          const [x, z] = xz(foco.lat, foco.lon);
          Object.assign(meta, { x, z: z + 0.6, d: modo === "app" ? 11 : 13, el: 0.85 });
        } else if (p.ruta && rutaCurva && modo !== "fondo") {
          const ini = rutaCurva.getPoint(0);
          const fin = rutaCurva.getPoint(1);
          const largo = ini.distanceTo(fin);
          Object.assign(meta, { x: (ini.x + fin.x) / 2, z: (ini.z + fin.z) / 2 + 1, d: Math.max(18, largo * 1.45), el: 0.95 });
        } else if (claveRec && modo !== "fondo") {
          const ls = (p.recorrido ?? []).map((id) => p.lugares.find((l) => l.id === id)).filter(Boolean) as Lugar[];
          if (ls.length) {
            const cx = ls.reduce((s, l) => s + xz(l.lat, l.lon)[0], 0) / ls.length;
            const cz = ls.reduce((s, l) => s + xz(l.lat, l.lon)[1], 0) / ls.length;
            const r = Math.max(...ls.map((l) => Math.hypot(xz(l.lat, l.lon)[0] - cx, xz(l.lat, l.lon)[1] - cz)));
            Object.assign(meta, { x: cx, z: cz + 0.5, d: Math.max(9, r * 4.2), el: 0.95 });
          }
        } else Object.assign(meta, vistaGeneral());
      }
      usuario = Math.max(0, usuario - dt);

      const deriva = reduce || usuario > 0 ? 0 : modo === "hero" || modo === "fondo" ? t * 0.05 : Math.sin(t * 0.08) * 0.12;
      const azMeta = (modo === "hero" || modo === "fondo" ? deriva : deriva) + (interactivo && modo === "escenario" ? puntero.x * 0.12 : modo === "hero" ? puntero.x * 0.1 : 0);
      const elMeta = meta.el - (modo === "escenario" || modo === "hero" ? puntero.y * 0.05 : 0) + scrollP * (modo === "fondo" ? 0.35 : 0.12);
      act.x = damp(act.x, meta.x + (modo === "fondo" ? scrollP * 6 : 0), 2.4, dt);
      act.z = damp(act.z, meta.z, 2.4, dt);
      act.d = damp(act.d, meta.d, 2.2, dt);
      act.el = damp(act.el, elMeta, 2.2, dt);
      act.az = damp(act.az, azMeta, 1.6, dt);
      objetivo.set(act.x, 0, act.z);
      camera.position.set(act.x + Math.sin(act.az) * Math.cos(act.el) * act.d, Math.sin(act.el) * act.d, act.z + Math.cos(act.az) * Math.cos(act.el) * act.d);
      camera.lookAt(objetivo);
      camera.getWorldQuaternion(camQ);

      // escala de pines y etiquetas según la distancia
      const esc = THREE.MathUtils.clamp(act.d / 32, 0.42, 1.5);
      const cats = p.cats ?? [];
      const favs = p.favoritos;
      pines.forEach((pin) => {
        const enFoco = pin.id === p.foco;
        const atenuado = cats.length > 0 && !cats.includes(pin.cat);
        pin.pop = Math.max(0, pin.pop - dt * 1.6);
        pin.caida = Math.max(0, pin.caida - dt * 0.9);
        const rebote = pin.pop > 0 ? Math.sin(pin.pop * Math.PI) * 0.6 : 0;
        const objetivoEsc = esc * (enFoco ? 1.55 : pin.id === hover ? 1.3 : 1) * (atenuado ? 0.55 : 1);
        pin.brillo = damp(pin.brillo, objetivoEsc, 8, dt);
        pin.g.scale.setScalar(pin.brillo * (1 + rebote));
        pin.g.position.y = 0.1 + pin.caida * pin.caida * 14 + (enFoco && !reduce ? Math.abs(Math.sin(t * 3)) * 0.25 * esc : 0);
        pin.g.visible = !atenuado || cats.length === 0 || modo !== "app" ? true : true;
        (pin.cabeza.material as THREE.MeshLambertMaterial).opacity = 1;
        pin.aro.visible = favs.includes(pin.id);
        if (pin.aro.visible) pin.aro.rotation.y = t * 1.2;
      });
      const opEtiq = THREE.MathUtils.smoothstep(act.d, 15, 26);
      etiquetas.forEach((s) => {
        s.scale.copy(s.userData.base as THREE.Vector3).multiplyScalar(THREE.MathUtils.clamp(act.d / 40, 0.5, 1.4));
        s.material.opacity = opEtiq;
        s.visible = opEtiq > 0.02;
      });
      marcas.forEach((s) => s.scale.set(0.5 * esc * 1.3, 0.5 * esc * 1.3, 1));
      obelisco.scale.setScalar(THREE.MathUtils.clamp(act.d / 30, 0.6, 1.4));

      // tarjeta de foto
      const url = foco && p.fotoFoco && modo !== "fondo" && modo !== "hero" ? p.fotoFoco : "";
      if (url) {
        cargarFoto(url);
        tarjetaT = Math.min(1, tarjetaT + dt * 1.8);
        tarjeta.visible = true;
        const [x, z] = xz(foco!.lat, foco!.lon);
        const sub = 1 - Math.pow(1 - tarjetaT, 3);
        tarjeta.position.set(x, (1.8 + sub * 1.5) * esc * 1.3, z);
        tarjeta.quaternion.copy(camQ);
        tarjeta.scale.setScalar(esc * 1.7 * (0.6 + sub * 0.4));
        (marco.material as THREE.MeshBasicMaterial).opacity = sub;
        (foto.material as THREE.MeshBasicMaterial).opacity = sub;
      } else {
        fotoActual = "";
        tarjeta.visible = false;
      }

      // ruta
      if (rutaMesh && rutaCurva) {
        rutaT = Math.min(1, rutaT + dt * 0.7);
        const total = (rutaMesh.geometry.index?.count ?? 0) as number;
        rutaMesh.geometry.setDrawRange(0, Math.floor(total * (1 - Math.pow(1 - rutaT, 2))));
        const vt = reduce ? 1 : (t * 0.12) % 1;
        rutaCurva.getPointAt(rutaT < 1 ? rutaT : vt, tmp);
        viajero.position.copy(tmp);
        viajero.scale.setScalar(esc * 0.9);
        halo.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
      }

      // avión
      const ciclo = reduce ? 0.98 : (t / 11) % 1;
      const posA = aproximacion.getPointAt(Math.min(ciclo / 0.85, 1));
      const sig = aproximacion.getPointAt(Math.min(ciclo / 0.85 + 0.01, 1));
      avion.position.copy(posA);
      if (sig.distanceToSquared(posA) > 1e-6) avion.lookAt(sig);
      avion.rotateY(-Math.PI / 2);
      avion.visible = ciclo < 0.92 && modo !== "fondo";
      avion.scale.setScalar(1.6 * THREE.MathUtils.clamp(act.d / 34, 0.7, 1.6));

      // señal
      antenas.forEach((a, i) => {
        (a.luz.material as THREE.MeshBasicMaterial).color.setHex(p.sinDatos ? 0xcf4a5a : 0x3fb984);
        a.anillos.forEach((r, j) => {
          const f = ((t * 0.45 + j * 0.5 + i * 0.17) % 1) as number;
          r.visible = !p.sinDatos && !reduce;
          r.scale.setScalar(0.4 + f * 5.5);
          (r.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.55;
        });
      });
      hemi.intensity = damp(hemi.intensity, p.sinDatos ? 1.25 : 1.55, 3, dt);

      ondas.forEach((o) => {
        if (o.t >= 1) {
          o.m.visible = false;
          return;
        }
        o.t = Math.min(1, o.t + dt * 0.7);
        o.m.scale.setScalar(0.5 + o.t * 7);
        (o.m.material as THREE.MeshBasicMaterial).opacity = (1 - o.t) * 0.85;
      });

      renderer.render(scene, camera);
    });

    return () => {
      vivo = false;
      cambioLugares.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("rumbo:scroll", onScroll);
      window.removeEventListener("scroll", onPagina);
      window.removeEventListener("rumbo:pulso", onOnda);
      window.removeEventListener("rumbo:pin", onPinNuevo);
      window.removeEventListener("rumbo:favorito", onFav);
      window.removeEventListener("rumbo:tarifa", onTarifa);
      window.removeEventListener("rumbo:paquete", onPaquete);
      window.removeEventListener("rumbo:zoom", zoom);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("wheel", wheel);
      etiquetas.forEach((s) => {
        s.material.map?.dispose();
        s.material.dispose();
      });
      marcas.forEach((s) => {
        s.material.map?.dispose();
        s.material.dispose();
      });
      (foto.material as THREE.MeshBasicMaterial).map?.dispose();
      k.dispose();
    };
  }, []);

  useEffect(() => {
    cambioLugares.current?.();
  }, [props.lugares]);

  return <div ref={ref} className={`mapa3d mapa3d-${props.modo}`} aria-label={props.modo === "app" ? "Mapa del Gran Buenos Aires" : undefined} aria-hidden={props.modo === "app" ? undefined : true} />;
}
