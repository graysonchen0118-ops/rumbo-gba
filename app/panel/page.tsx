"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, CalendarClock, CalendarX2, FileText, HardDriveUpload, Languages, Loader2, MapPin, PackageCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { EQUIPO } from "@/lib/mock/transporte";
import { diasDesde, fechaCorta, haceTexto, hora } from "@/lib/format";
import { Avatar, Skel, Tilt } from "@/components/ui";

export default function Resumen() {
  const { listo, lugares, eventos, paquete, actividad, ahora, verificarLugar, publicarPaquete, toast } = useStore();
  const [publicando, setPublicando] = useState(false);
  const [verificando, setVerificando] = useState<string | null>(null);

  const datos = useMemo(() => {
    const pub = lugares.filter((l) => l.estado === "publicado");
    const vigentes = eventos.filter((e) => e.estado === "publicado" && new Date(e.fin) > ahora);
    const vencidos = eventos.filter((e) => e.estado === "publicado" && new Date(e.fin) <= ahora);
    const viejas = pub.filter((l) => diasDesde(l.verificado, ahora) > 60).sort((a, b) => a.verificado.localeCompare(b.verificado));
    const vencenHoy = vigentes.filter((e) => new Date(e.fin).toDateString() === ahora.toDateString());
    const en = pub.filter((l) => l.texto.en).length;
    const pt = pub.filter((l) => l.texto.pt).length;
    return { pub, vigentes, vencidos, viejas, vencenHoy, en, pt, borradores: lugares.length - pub.length };
  }, [lugares, eventos, ahora]);

  const publicar = async () => {
    setPublicando(true);
    try {
      await publicarPaquete();
      toast(`Paquete versión ${paquete.version + 1} publicado. Los teléfonos lo bajan solos con wifi.`);
    } finally {
      setPublicando(false);
    }
  };

  if (!listo) {
    return (
      <div className="pn-grid">
        {[0, 1, 2, 3].map((i) => (
          <Skel key={i} h={110} r={18} />
        ))}
      </div>
    );
  }

  const kpis = [
    { t: "Lugares publicados", v: datos.pub.length, d: `${datos.borradores} en borrador`, ic: MapPin, href: "/panel/lugares" },
    { t: "Eventos vigentes", v: datos.vigentes.length, d: `${datos.vencenHoy.length} vencen hoy`, ic: CalendarClock, href: "/panel/eventos" },
    { t: "Retirados solos", v: datos.vencidos.length, d: "eventos que ya terminaron", ic: CalendarX2, href: "/panel/eventos" },
    { t: "Sin verificar hace 60 días", v: datos.viejas.length, d: "fichas para revisar", ic: AlertTriangle, href: "/panel/lugares", alerta: datos.viejas.length > 0 },
  ];

  return (
    <div className="pn-pagina">
      <div className="pn-titulo">
        <h1>Buenas, {EQUIPO[0].nombre.split(" ")[0]}</h1>
        <p className="muted">Lo que ven hoy los turistas en la app y lo que conviene revisar.</p>
      </div>

      <div className="kpis">
        {kpis.map((k, i) => {
          const Ic = k.ic;
          return (
            <Link key={k.t} href={k.href} className={`kpi ${k.alerta ? "alerta" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
              <span className="kpi-ic">
                <Ic size={18} />
              </span>
              <strong>{k.v}</strong>
              <span>{k.t}</span>
              <small>{k.d}</small>
            </Link>
          );
        })}
      </div>

      <div className="pn-grid">
        <Tilt className="pn-card paquete-panel" max={4}>
          <div className="pn-card-cab">
            <h2>
              <PackageCheck size={18} /> Paquete sin conexión
            </h2>
            <span className="badge ok">Versión {paquete.version}</span>
          </div>
          <p className="muted">
            Es lo que el teléfono guarda al instalar la app y lo que se usa en el aeropuerto sin chip. Publicado {haceTexto(paquete.publicado, ahora)}, {paquete.pesoMb} MB.
          </p>
          <ul className="incluye">
            {paquete.incluye.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <button className="btn btn-pri" onClick={publicar} disabled={publicando}>
            {publicando ? <Loader2 size={16} className="gira" /> : <HardDriveUpload size={16} />}
            {publicando ? "Armando el paquete" : `Publicar versión ${paquete.version + 1}`}
          </button>
        </Tilt>

        <div className="pn-card">
          <div className="pn-card-cab">
            <h2>
              <Languages size={18} /> Idiomas de las fichas
            </h2>
          </div>
          {[
            { t: "Español", n: datos.pub.length },
            { t: "Inglés", n: datos.en },
            { t: "Portugués", n: datos.pt },
          ].map((x) => (
            <div key={x.t} className="barra-idioma">
              <span>{x.t}</span>
              <div className="barra">
                <i style={{ width: `${(x.n / Math.max(1, datos.pub.length)) * 100}%` }} />
              </div>
              <small>
                {x.n} de {datos.pub.length}
              </small>
            </div>
          ))}
          <p className="muted chico">Una ficha sin traducir se muestra en español con un aviso, nunca vacía.</p>
        </div>

        <div className="pn-card">
          <div className="pn-card-cab">
            <h2>
              <BadgeCheck size={18} /> Para verificar en persona
            </h2>
            <Link href="/panel/lugares" className="link">
              Ver todas
            </Link>
          </div>
          {datos.viejas.length === 0 ? (
            <p className="muted">Todas las fichas publicadas se verificaron en los últimos 60 días.</p>
          ) : (
            <ul className="pn-lista">
              {datos.viejas.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <span>
                    <strong>{l.nombre}</strong>
                    <small>
                      Última vez el {fechaCorta(l.verificado)}, hace {diasDesde(l.verificado, ahora)} días
                    </small>
                  </span>
                  <button
                    className="btn btn-sec chico"
                    disabled={verificando === l.id}
                    onClick={async () => {
                      setVerificando(l.id);
                      await verificarLugar(l.id);
                      setVerificando(null);
                      toast(`${l.nombre} quedó verificado hoy`);
                    }}
                  >
                    {verificando === l.id ? <Loader2 size={14} className="gira" /> : <BadgeCheck size={14} />}
                    Verificado hoy
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pn-card">
          <div className="pn-card-cab">
            <h2>
              <CalendarClock size={18} /> Vencen hoy
            </h2>
          </div>
          {datos.vencenHoy.length === 0 ? (
            <p className="muted">Ningún evento termina hoy.</p>
          ) : (
            <ul className="pn-lista">
              {datos.vencenHoy.map((e) => (
                <li key={e.id}>
                  <span>
                    <strong>{e.titulo}</strong>
                    <small>
                      Sale de la app a las {hora(e.fin)}, sin que nadie lo toque
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pn-card pn-card-ancha">
          <div className="pn-card-cab">
            <h2>
              <FileText size={18} /> Actividad del equipo
            </h2>
          </div>
          <ul className="actividad">
            {actividad.slice(0, 8).map((a) => {
              const p = EQUIPO.find((x) => x.id === a.quien) ?? EQUIPO[0];
              return (
                <li key={a.id} className="aparece">
                  <Avatar k={p.foto} nombre={p.nombre} size={32} />
                  <span>
                    <strong>{p.nombre.split(" ")[0]}</strong> {a.texto}
                    <small>{haceTexto(a.cuando, ahora)}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
