"use client";

import Link from "next/link";
import { BadgeCheck, CalendarClock, Compass, LayoutDashboard, MapPin, PlaneLanding, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAncho, useEventosVigentes, usePublicados } from "@/lib/vista";
import { CATEGORIAS, distanciaTexto, km } from "@/lib/format";
import { DESTINOS, OPCIONES_LLEGADA, RECORRIDOS } from "@/lib/mock/transporte";
import { AEROPUERTOS } from "./three/geo";
import type { Categoria } from "@/lib/types";
import { MapaGBA } from "./three/Scenes";
import GuiaApp from "./app/GuiaApp";
import { foto } from "@/lib/photos";
import { Switch, Toasts } from "./ui";

export default function Experiencia() {
  const ancho = useAncho();
  const s = useStore();
  const { tab, foco, favoritos, sinDatos, alternarSinDatos, rutaVisible, aeropuerto, destino, recorrido, filtros, setFiltros, abrirLugar, enfocar, irA, setAeropuerto, ubicacion, vista, pendientes, listo } = s;
  const publicados = usePublicados();
  const eventos = useEventosVigentes();
  const marco = ancho !== null && ancho >= 768;
  const escritorio = ancho !== null && ancho >= 1024;
  const dest = DESTINOS.find((d) => d.id === destino);
  const rec = recorrido ? RECORRIDOS.find((r) => r.id === recorrido) : null;
  const enFoco = foco ? publicados.find((l) => l.id === foco) : null;
  const izq = ancho && ancho <= 1180 ? 340 : 380;
  const der = ancho && ancho <= 1180 ? 450 : 470;
  const centroX = escritorio && ancho ? (izq + (ancho - der - izq) / 2) / ancho : undefined;
  const rutaEnEscenario = rutaVisible || tab === "llegada";
  const opcionesAhora = OPCIONES_LLEGADA.filter((o) => o.aeropuerto === aeropuerto).length;

  if (ancho === null) {
    return <div className="cargando-pantalla" aria-hidden="true" />;
  }

  if (!marco) {
    return (
      <div className="exp-movil">
        <GuiaApp marco={false} />
        <Toasts />
      </div>
    );
  }

  const alternarCat = (c: Categoria) => setFiltros({ cats: filtros.cats.includes(c) ? filtros.cats.filter((x) => x !== c) : [...filtros.cats, c] });

  return (
    <div className={`exp ${escritorio ? "exp-escritorio" : "exp-tablet"}`}>
      <div className="escenario">
        <MapaGBA
          modo="escenario"
          lugares={publicados}
          favoritos={favoritos}
          foco={foco}
          fotoFoco={enFoco ? foto(enFoco.fotos[0], 480, 340) : null}
          sinDatos={sinDatos}
          ruta={rutaEnEscenario ? aeropuerto : null}
          destino={rutaEnEscenario && dest ? dest : null}
          recorrido={rec ? rec.paradas : null}
          cats={filtros.cats}
          pausado={tab === "mapa"}
          centroX={centroX}
          onPin={(id) => {
            abrirLugar(id);
          }}
        />
      </div>

      <header className="exp-top">
        <Link href="/" className="exp-marca">
          <span className="marca-ic">
            <Compass size={18} strokeWidth={2.4} />
          </span>
          <span>
            <strong>Rumbo</strong>
            <small>Guía del Gran Buenos Aires</small>
          </span>
        </Link>
        <nav className="exp-nav">
          <Link href="/" className="on">
            <Smartphone size={16} /> La app
          </Link>
          <Link href="/panel">
            <LayoutDashboard size={16} /> Panel de contenido
          </Link>
        </nav>
      </header>

      {escritorio && (
        <aside className="exp-info">
          <h1>El Gran Buenos Aires en el bolsillo, con señal o sin ella.</h1>
          <p className="exp-bajada">Atracciones, eventos, comida, alojamiento y cómo llegar desde el aeropuerto. Lo que importa al aterrizar queda guardado en el teléfono.</p>

          <div className={`senal-card ${sinDatos ? "off" : ""}`}>
            <span className="senal-ic">{sinDatos ? <WifiOff size={18} /> : <Wifi size={18} />}</span>
            <div>
              <strong>{sinDatos ? "Teléfono sin datos" : "Teléfono con datos"}</strong>
              <small>{sinDatos ? `Funciona con el paquete ${vista.paquete.version}${pendientes ? `, ${pendientes} ${pendientes === 1 ? "cambio espera" : "cambios esperan"} señal` : ""}` : "Cortalo para ver la app como al bajar del avión sin roaming"}</small>
            </div>
            <Switch on={sinDatos} onChange={alternarSinDatos} label="Sin datos" />
          </div>

          <div className="contexto-card" key={enFoco?.id ?? (rutaEnEscenario ? "ruta" : rec ? rec.id : "general")}>
            {enFoco ? (
              <>
                <small style={{ color: CATEGORIAS[enFoco.categoria].color }}>{CATEGORIAS[enFoco.categoria].nombre}</small>
                <strong>{enFoco.nombre}</strong>
                <p>
                  <MapPin size={13} /> {enFoco.barrio}, a {distanciaTexto(km(ubicacion, enFoco))} de {ubicacion.nombre}
                </p>
                <button className="link" onClick={() => enfocar(null)}>
                  Volver a todo el mapa
                </button>
              </>
            ) : rutaEnEscenario ? (
              <>
                <small>Camino en el mapa</small>
                <strong>
                  {AEROPUERTOS[aeropuerto].nombre} a {dest?.nombre}
                </strong>
                <p>
                  <PlaneLanding size={13} /> {opcionesAhora} formas de llegar, todas guardadas en el teléfono
                </p>
                <div className="mini-seg">
                  <button className={aeropuerto === "eze" ? "on" : ""} onClick={() => setAeropuerto("eze")}>
                    Ezeiza
                  </button>
                  <button className={aeropuerto === "aep" ? "on" : ""} onClick={() => setAeropuerto("aep")}>
                    Aeroparque
                  </button>
                </div>
              </>
            ) : rec ? (
              <>
                <small>Recorrido sugerido</small>
                <strong>{rec.titulo}</strong>
                <p>{rec.bajada}</p>
              </>
            ) : (
              <>
                <small>Hoy en la guía</small>
                <strong>
                  {listo ? publicados.length : "..."} lugares y {listo ? eventos.length : "..."} eventos vigentes
                </strong>
                <p>
                  <BadgeCheck size={13} /> Cada ficha dice cuándo la verificó el equipo
                </p>
                <button className="link" onClick={() => irA("llegada")}>
                  <PlaneLanding size={14} /> Ver la llegada desde Ezeiza
                </button>
              </>
            )}
          </div>

          <div className="leyenda">
            <small>Tocá una categoría para filtrar el mapa</small>
            <div className="leyenda-chips">
              {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                <button key={c} className={`chip ${filtros.cats.includes(c) ? "on" : ""}`} onClick={() => alternarCat(c)} style={{ ["--c" as string]: CATEGORIAS[c].color }}>
                  <i />
                  {CATEGORIAS[c].nombre}
                </button>
              ))}
            </div>
          </div>

          <p className="exp-nota">
            <CalendarClock size={13} /> Los eventos vencidos se retiran solos y las tarifas se corrigen desde el panel, sin publicar otra versión en las tiendas.
          </p>
        </aside>
      )}

      <div className="exp-telefono">
        <div className="telefono">
          <GuiaApp marco />
        </div>
      </div>

      <footer className="exp-pie">
        <span>© 2026 Rumbo · Guía del Gran Buenos Aires</span>
        <span>Fotos: Unsplash</span>
      </footer>
      <Toasts />
    </div>
  );
}
