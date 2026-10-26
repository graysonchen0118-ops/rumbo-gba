"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Compass, LayoutDashboard, MapPin, Menu, Smartphone, TicketPercent, Wifi, WifiOff, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { EQUIPO } from "@/lib/mock/transporte";
import { usePublicados } from "@/lib/vista";
import { MapaGBA } from "../three/Scenes";
import { Avatar, Toasts } from "../ui";

const NAV = [
  { href: "/panel", texto: "Resumen", icono: LayoutDashboard },
  { href: "/panel/lugares", texto: "Lugares", icono: MapPin },
  { href: "/panel/eventos", texto: "Eventos", icono: CalendarDays },
  { href: "/panel/tarifas", texto: "Tarifas y llegada", icono: TicketPercent },
];

export default function PanelShell({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const { lugares, eventos, ahora, listo, favoritos, sinDatos, alternarSinDatos } = useStore();
  const publicados = usePublicados();
  const actual = NAV.find((n) => (n.href === "/panel" ? ruta === "/panel" : ruta.startsWith(n.href)));
  const lucia = EQUIPO[0];
  const borradores = lugares.filter((l) => l.estado === "borrador").length;
  const vencenHoy = eventos.filter((e) => {
    const f = new Date(e.fin);
    return f > ahora && f.toDateString() === ahora.toDateString();
  }).length;

  useEffect(() => setAbierto(false), [ruta]);

  return (
    <div className="pn">
      <div className="pn-fondo">
        <MapaGBA modo="fondo" lugares={publicados} favoritos={favoritos} foco={null} sinDatos={sinDatos} ruta={null} />
        <div className="pn-velo" />
      </div>
      <aside className={`pn-side ${abierto ? "open" : ""}`}>
        <div className="pn-marca">
          <span className="marca-ic">
            <Compass size={18} strokeWidth={2.4} />
          </span>
          <span>
            <strong>Rumbo</strong>
            <small>Panel de contenido</small>
          </span>
          <button className="icon-btn pn-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>
        <nav className="pn-nav">
          {NAV.map((n) => {
            const Ic = n.icono;
            const on = actual?.href === n.href;
            const cuenta = listo ? (n.href === "/panel/lugares" ? borradores : n.href === "/panel/eventos" ? vencenHoy : 0) : 0;
            return (
              <Link key={n.href} href={n.href} className={`pn-item ${on ? "on" : ""}`}>
                <Ic size={18} />
                <span>{n.texto}</span>
                {cuenta > 0 && <em>{cuenta}</em>}
              </Link>
            );
          })}
        </nav>
        <div className="pn-side-pie">
          <div className={`pn-telefono ${sinDatos ? "off" : ""}`}>
            {sinDatos ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>
              <strong>Teléfono de prueba</strong>
              <small>{sinDatos ? "Sin datos, recibe al volver la señal" : "Con datos, recibe al instante"}</small>
            </span>
            <button className="link" onClick={alternarSinDatos}>
              {sinDatos ? "Conectar" : "Cortar"}
            </button>
          </div>
          <Link href="/" className="btn btn-sec ancho">
            <Smartphone size={16} /> Ver la app
          </Link>
          <div className="pn-quien">
            <Avatar k={lucia.foto} nombre={lucia.nombre} size={36} />
            <span>
              <strong>{lucia.nombre}</strong>
              <small>{lucia.rol}</small>
            </span>
          </div>
        </div>
      </aside>
      <div className={`scrim ${abierto ? "show" : ""}`} onClick={() => setAbierto(false)} />
      <div className="pn-main">
        <header className="pn-top">
          <button className="icon-btn pn-menu" onClick={() => setAbierto(true)} aria-label="Abrir menú">
            <Menu size={20} />
          </button>
          <div>
            <small>Panel de contenido</small>
            <strong>{actual?.texto ?? "Panel"}</strong>
          </div>
        </header>
        <main className="pn-contenido">{children}</main>
        <footer className="pn-pie">
          <span>© 2026 Rumbo · Guía del Gran Buenos Aires</span>
          <span>Fotos: Unsplash</span>
        </footer>
      </div>
      <Toasts />
    </div>
  );
}
