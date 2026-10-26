"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CloudOff, Compass, HardDriveDownload, Heart, LayoutDashboard, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIAS, diaTexto, haceTexto, hora } from "@/lib/format";
import type { Idioma } from "@/lib/types";
import { Foto, Switch, Vacio } from "../ui";

const IDIOMAS: { id: Idioma; texto: string }[] = [
  { id: "es", texto: "Español" },
  { id: "en", texto: "English" },
  { id: "pt", texto: "Português" },
];

export default function Guardados({ marco }: { marco: boolean }) {
  const { vista, favoritos, alternarFavorito, abrirLugar, abrirEvento, irA, idioma, setIdioma, sinDatos, alternarSinDatos, ahora, listo } = useStore();
  const [vistaSel, setVistaSel] = useState<"lugares" | "eventos">("lugares");
  const lugares = favoritos.map((id) => vista.lugares.find((l) => l.id === id)).filter(Boolean) as typeof vista.lugares;
  const eventos = favoritos.map((id) => vista.eventos.find((e) => e.id === id)).filter(Boolean) as typeof vista.eventos;

  return (
    <div className="guardados">
      <div className="agenda-cab">
        <div>
          <h2>Guardados</h2>
          <small className="muted">
            <CloudOff size={12} /> Todo lo que guardás queda disponible sin conexión
          </small>
        </div>
      </div>
      <div className="segmento segmento-chico" role="tablist">
        <button role="tab" aria-selected={vistaSel === "lugares"} className={vistaSel === "lugares" ? "on" : ""} onClick={() => setVistaSel("lugares")}>
          Lugares <small>{lugares.length}</small>
        </button>
        <button role="tab" aria-selected={vistaSel === "eventos"} className={vistaSel === "eventos" ? "on" : ""} onClick={() => setVistaSel("eventos")}>
          Eventos <small>{eventos.length}</small>
        </button>
      </div>

      {vistaSel === "lugares" ? (
        lugares.length === 0 ? (
          <Vacio icono={<Heart size={22} />} titulo="Todavía no guardaste lugares" texto="Tocá Guardar en cualquier ficha y queda en el teléfono, con fotos, para cuando no haya señal." accion={<button className="btn btn-pri" onClick={() => irA("explorar")}><Compass size={16} /> Explorar</button>} />
        ) : (
          <div className="lista">
            {lugares.map((l) => (
              <div key={l.id} className="item item-guardado">
                <button className="item-abrir" onClick={() => abrirLugar(l.id)}>
                  <Foto k={l.fotos[0]} w={128} h={128} alt={l.nombre} className="item-foto" />
                  <span className="item-txt">
                    <strong>{l.nombre}</strong>
                    <small>
                      <i className="punto" style={{ background: CATEGORIAS[l.categoria].color }} />
                      {CATEGORIAS[l.categoria].nombre} · {l.barrio}
                    </small>
                    <small className="disp-off">
                      <HardDriveDownload size={11} /> Con fotos, sin conexión
                    </small>
                  </span>
                </button>
                <button className="icon-btn" onClick={() => alternarFavorito(l.id)} aria-label={`Quitar ${l.nombre}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : eventos.length === 0 ? (
        <Vacio icono={<CalendarDays size={22} />} titulo="Sin eventos guardados" texto="Guardá un evento de la agenda y lo tenés a mano aunque no haya señal." accion={<button className="btn btn-pri" onClick={() => irA("agenda")}>Ver agenda</button>} />
      ) : (
        <div className="lista">
          {eventos.map((e) => {
            const termino = new Date(e.fin) <= ahora;
            return (
              <div key={e.id} className={`item item-guardado ${termino ? "terminado" : ""}`}>
                <button className="item-abrir" onClick={() => abrirEvento(e.id)}>
                  <Foto k={e.foto} w={128} h={128} alt={e.titulo} className="item-foto" />
                  <span className="item-txt">
                    <strong>{e.titulo}</strong>
                    <small>{termino ? "Ya terminó" : `${diaTexto(e.inicio, ahora)}, ${hora(e.inicio)}`}</small>
                    <small>{e.lugar}</small>
                  </span>
                </button>
                <button className="icon-btn" onClick={() => alternarFavorito(e.id)} aria-label={`Quitar ${e.titulo}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <section className="ajustes">
        <h3>Ajustes</h3>
        <div className="ajuste">
          <span>
            <strong>Idioma de las fichas</strong>
            <small>Si una ficha no está traducida, se muestra en español.</small>
          </span>
          <div className="idiomas">
            {IDIOMAS.map((i) => (
              <button key={i.id} className={`idioma ${idioma === i.id ? "on" : ""}`} onClick={() => setIdioma(i.id)}>
                {i.texto}
              </button>
            ))}
          </div>
        </div>
        <div className="ajuste ajuste-fila">
          <span>
            <strong>Sin datos</strong>
            <small>Usa solo lo guardado y no gasta roaming.</small>
          </span>
          <Switch on={sinDatos} onChange={alternarSinDatos} label="Sin datos" />
        </div>
        <div className="ajuste">
          <span>
            <strong>Paquete sin conexión</strong>
            <small>
              Versión {vista.paquete.version}, {vista.paquete.pesoMb} MB{listo ? `, ${haceTexto(vista.paquete.publicado, ahora)}` : ""}
            </small>
          </span>
          <ul className="incluye">
            {vista.paquete.incluye.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        {!marco && (
          <Link href="/panel" className="btn btn-sec ancho">
            <LayoutDashboard size={16} /> Panel de contenido del equipo
          </Link>
        )}
      </section>
      <p className="pie-app">© 2026 Rumbo · Guía del Gran Buenos Aires</p>
    </div>
  );
}
