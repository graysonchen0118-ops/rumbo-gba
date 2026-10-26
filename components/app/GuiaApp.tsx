"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BatteryFull, CalendarDays, Check, Compass, Heart, LayoutDashboard, Map as MapIcon, MapPin, Plane, PlaneLanding, Signal, Wifi, WifiOff, X } from "lucide-react";
import { useStore, type Tab } from "@/lib/store";
import { UBICACIONES } from "@/lib/mock/barrios";
import { hora } from "@/lib/format";
import Explorar from "./Explorar";
import MapaTab from "./MapaTab";
import Llegada from "./Llegada";
import Agenda from "./Agenda";
import Guardados from "./Guardados";
import { DetalleEvento, DetalleLugar } from "./Detalle";

const TABS: { id: Tab; texto: string; icono: typeof Compass }[] = [
  { id: "explorar", texto: "Explorar", icono: Compass },
  { id: "mapa", texto: "Mapa", icono: MapIcon },
  { id: "llegada", texto: "Llegada", icono: PlaneLanding },
  { id: "agenda", texto: "Agenda", icono: CalendarDays },
  { id: "guardados", texto: "Guardados", icono: Heart },
];

export default function GuiaApp({ marco }: { marco: boolean }) {
  const { tab, irA, sinDatos, alternarSinDatos, ubicacion, setUbicacion, ahora, listo, favoritos, pendientes, vista } = useStore();
  const [ubiAbierta, setUbiAbierta] = useState(false);
  const cuerpo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    cuerpo.current?.scrollTo({ top: 0 });
    window.dispatchEvent(new CustomEvent("rumbo:scroll", { detail: { p: 0 } }));
  }, [tab]);

  const onScroll = () => {
    const el = cuerpo.current;
    if (!el) return;
    const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    window.dispatchEvent(new CustomEvent("rumbo:scroll", { detail: { p } }));
  };

  return (
    <div className={`app ${marco ? "app-marco" : "app-pantalla"} ${sinDatos ? "app-offline" : ""}`}>
      {marco && (
        <div className="barra-estado" aria-hidden="true">
          <span className="be-hora">{listo ? hora(ahora.toISOString()) : "--:--"}</span>
          <span className="be-isla" />
          <span className="be-iconos">
            {sinDatos ? <Plane size={13} /> : <Signal size={13} />}
            {!sinDatos && <Wifi size={13} />}
            <BatteryFull size={16} />
          </span>
        </div>
      )}
      <header className="app-cab">
        <div className="app-marca">
          <span className="marca-ic">
            <Compass size={18} strokeWidth={2.4} />
          </span>
          <div>
            <strong>Rumbo</strong>
            <button className="ubi-chip" onClick={() => setUbiAbierta(true)}>
              <MapPin size={12} />
              {ubicacion.nombre}
            </button>
          </div>
        </div>
        <div className="app-cab-acc">
          <button className={`datos-btn ${sinDatos ? "off" : ""}`} onClick={alternarSinDatos} aria-pressed={sinDatos} title="Usar solo lo guardado en el teléfono">
            {sinDatos ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{sinDatos ? "Sin datos" : "Con datos"}</span>
          </button>
          {!marco && (
            <Link href="/panel" className="icon-btn" aria-label="Panel de contenido">
              <LayoutDashboard size={18} />
            </Link>
          )}
        </div>
      </header>

      {sinDatos && (
        <div className="banner-offline">
          <WifiOff size={15} />
          <span>
            Sin conexión. La guía de llegada, el mapa y tus guardados siguen funcionando con el paquete {vista.paquete.version}.
            {pendientes > 0 && <b> {pendientes} {pendientes === 1 ? "cambio espera" : "cambios esperan"} la señal.</b>}
          </span>
        </div>
      )}

      <div className={`app-cuerpo ${tab === "mapa" ? "app-cuerpo-mapa" : ""}`} ref={cuerpo} onScroll={onScroll}>
        <div key={tab} className="vista-entra">
          {tab === "explorar" && <Explorar marco={marco} />}
          {tab === "mapa" && <MapaTab />}
          {tab === "llegada" && <Llegada />}
          {tab === "agenda" && <Agenda />}
          {tab === "guardados" && <Guardados marco={marco} />}
        </div>
      </div>

      <nav className="app-tabs" aria-label="Secciones">
        {TABS.map((t) => {
          const Ic = t.icono;
          const on = tab === t.id;
          return (
            <button key={t.id} className={`tab ${on ? "on" : ""}`} onClick={() => irA(t.id)} aria-current={on ? "page" : undefined}>
              <span className="tab-ic">
                <Ic size={20} strokeWidth={on ? 2.4 : 2} />
                {t.id === "guardados" && favoritos.length > 0 && <em>{favoritos.length}</em>}
              </span>
              <span>{t.texto}</span>
            </button>
          );
        })}
      </nav>

      <DetalleLugar />
      <DetalleEvento />

      {ubiAbierta && (
        <div className="hoja-capa" onClick={() => setUbiAbierta(false)}>
          <div className="hoja hoja-corta" onClick={(e) => e.stopPropagation()}>
            <div className="hoja-asa" />
            <div className="hoja-tit">
              <strong>¿Dónde estás?</strong>
              <button className="icon-btn" onClick={() => setUbiAbierta(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <p className="muted chico">Las distancias y lo que está cerca se calculan desde acá.</p>
            <div className="ubi-lista">
              {UBICACIONES.map((u) => (
                <button
                  key={u.id}
                  className={`ubi-op ${u.id === ubicacion.id ? "on" : ""}`}
                  onClick={() => {
                    setUbicacion(u.id);
                    setUbiAbierta(false);
                  }}
                >
                  <MapPin size={16} />
                  <span>
                    <strong>{u.nombre}</strong>
                    <small>{u.detalle}</small>
                  </span>
                  {u.id === ubicacion.id && <Check size={16} />}
                </button>
              ))}
            </div>
            <p className="muted chico">Paquete sin conexión versión {vista.paquete.version} en el teléfono.</p>
          </div>
        </div>
      )}
    </div>
  );
}
