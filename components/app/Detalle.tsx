"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, Clock, Heart, ImageOff, Languages, Map as MapIcon, MapPin, TrainFront, Wallet, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { abiertoAhora, CATEGORIAS, CATEGORIAS_EVENTO, diaTexto, distanciaTexto, fechaCorta, hora, horarioTexto, km, PRECIO } from "@/lib/format";
import { useEventosVigentes } from "@/lib/vista";
import type { Idioma } from "@/lib/types";
import { Foto, Nota } from "../ui";

const IDIOMAS: { id: Idioma; texto: string }[] = [
  { id: "es", texto: "Español" },
  { id: "en", texto: "English" },
  { id: "pt", texto: "Português" },
];

function SelectorIdioma({ disponibles }: { disponibles: Partial<Record<Idioma, string>> }) {
  const { idioma, setIdioma } = useStore();
  return (
    <div className="idiomas" role="radiogroup" aria-label="Idioma de la ficha">
      <Languages size={14} />
      {IDIOMAS.map((i) => (
        <button key={i.id} role="radio" aria-checked={idioma === i.id} className={`idioma ${idioma === i.id ? "on" : ""} ${disponibles[i.id] ? "" : "falta"}`} onClick={() => setIdioma(i.id)}>
          {i.texto}
        </button>
      ))}
    </div>
  );
}

function TextoIdioma({ texto }: { texto: Partial<Record<Idioma, string>> }) {
  const { idioma } = useStore();
  const t = texto[idioma];
  return (
    <div className="ficha-texto">
      <p key={idioma} className="aparece">
        {t ?? texto.es}
      </p>
      {!t && idioma !== "es" && <small className="aviso-idioma">Esta ficha todavía no está traducida al {idioma === "pt" ? "portugués" : "inglés"}. Se muestra en español.</small>}
    </div>
  );
}

export function DetalleLugar() {
  const { lugarSel, cerrarLugar, vista, favoritos, alternarFavorito, ubicacion, ahora, sinDatos, irA, enfocar, abrirEvento } = useStore();
  const eventos = useEventosVigentes();
  const l = vista.lugares.find((x) => x.id === lugarSel) ?? null;
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [lugarSel]);
  if (!l) return null;
  const fav = favoritos.includes(l.id);
  const galeriaGuardada = !sinDatos || fav;
  const abierto = abiertoAhora(l.horarios, ahora);
  const aca = eventos.filter((e) => km(e, l) < 0.25).slice(0, 3);
  return (
    <div className="hoja-capa" onClick={cerrarLugar}>
      <article className="hoja hoja-ficha" onClick={(e) => e.stopPropagation()} aria-label={l.nombre}>
        <div className="galeria">
          {galeriaGuardada ? (
            <>
              <div
                className="galeria-pista"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setIdx(Math.round(el.scrollLeft / el.clientWidth));
                }}
              >
                {l.fotos.map((f, i) => (
                  <Foto key={f + i} k={f} w={780} h={520} alt={`${l.nombre}, foto ${i + 1}`} eager={i === 0} />
                ))}
              </div>
              <div className="galeria-puntos">
                {l.fotos.map((f, i) => (
                  <i key={f + i} className={i === idx ? "on" : ""} />
                ))}
              </div>
            </>
          ) : (
            <div className="galeria-off">
              <ImageOff size={26} />
              <strong>La galería se descarga con conexión</strong>
              <small>Guardá el lugar y sus fotos quedan en el teléfono para la próxima vez.</small>
            </div>
          )}
          <button className="icon-btn flotante" onClick={cerrarLugar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="ficha-cuerpo">
          <div className="ficha-cab">
            <span className="cat-chip" style={{ ["--c" as string]: CATEGORIAS[l.categoria].color }}>
              {CATEGORIAS[l.categoria].nombre}
            </span>
            <h2>{l.nombre}</h2>
            <div className="ficha-meta">
              <Nota v={l.valoracion} n={l.opiniones} />
              <span>{PRECIO[l.precio]}</span>
              <span>{distanciaTexto(km(ubicacion, l))} de {ubicacion.nombre}</span>
              {abierto ? <b className="abierto">Abierto ahora</b> : <b className="cerrado">Cerrado ahora</b>}
            </div>
          </div>

          <SelectorIdioma disponibles={l.texto} />
          <TextoIdioma texto={l.texto} />

          <ul className="ficha-datos">
            <li>
              <MapPin size={16} />
              <span>
                {l.direccion}
                <small>{l.barrio}</small>
              </span>
            </li>
            <li>
              <Clock size={16} />
              <span>{l.categoria === "alojamiento" ? "Recepción las 24 horas" : horarioTexto(l.horarios)}</span>
            </li>
            <li>
              <TrainFront size={16} />
              <span>{l.comoLlegar}</span>
            </li>
            <li>
              <Wallet size={16} />
              <span>{l.precio === 0 ? "Entrada libre" : `Rango de precio ${PRECIO[l.precio]}`}</span>
            </li>
          </ul>

          <div className="etiquetas">
            {l.etiquetas.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>

          <p className="verificado">
            <BadgeCheck size={15} /> Datos verificados por el equipo el {fechaCorta(l.verificado)}
          </p>

          {aca.length > 0 && (
            <div className="ficha-eventos">
              <h3>Pasa acá</h3>
              {aca.map((e) => (
                <button key={e.id} className="mini-evento" onClick={() => abrirEvento(e.id)}>
                  <CalendarDays size={15} />
                  <span>
                    <strong>{e.titulo}</strong>
                    <small>
                      {diaTexto(e.inicio, ahora)}, {hora(e.inicio)}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <footer className="ficha-pie">
          <button className={`btn ${fav ? "btn-fav-on" : "btn-sec"}`} onClick={() => alternarFavorito(l.id)} aria-pressed={fav}>
            <Heart size={17} fill={fav ? "currentColor" : "none"} />
            {fav ? "Guardado" : "Guardar"}
          </button>
          <button
            className="btn btn-pri"
            onClick={() => {
              irA("mapa");
              enfocar(l.id);
            }}
          >
            <MapIcon size={17} />
            Ver en el mapa
          </button>
        </footer>
      </article>
    </div>
  );
}

export function DetalleEvento() {
  const { eventoSel, cerrarEvento, vista, favoritos, alternarFavorito, ahora, sinDatos } = useStore();
  const e = vista.eventos.find((x) => x.id === eventoSel) ?? null;
  if (!e) return null;
  const fav = favoritos.includes(e.id);
  return (
    <div className="hoja-capa" onClick={cerrarEvento}>
      <article className="hoja hoja-ficha" onClick={(ev) => ev.stopPropagation()} aria-label={e.titulo}>
        <div className="galeria galeria-una">
          {!sinDatos || fav ? (
            <Foto k={e.foto} w={780} h={440} alt={e.titulo} eager />
          ) : (
            <div className="galeria-off">
              <ImageOff size={26} />
              <strong>La foto se descarga con conexión</strong>
            </div>
          )}
          <button className="icon-btn flotante" onClick={cerrarEvento} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="ficha-cuerpo">
          <div className="ficha-cab">
            <span className="cat-chip ev">{CATEGORIAS_EVENTO[e.categoria]}</span>
            <h2>{e.titulo}</h2>
            <div className="ficha-meta">
              <span>
                {diaTexto(e.inicio, ahora)}, {hora(e.inicio)} a {hora(e.fin)}
              </span>
              <span>{e.precio}</span>
            </div>
          </div>
          <SelectorIdioma disponibles={e.texto} />
          <TextoIdioma texto={e.texto} />
          <ul className="ficha-datos">
            <li>
              <MapPin size={16} />
              <span>
                {e.lugar}
                <small>{e.barrio}</small>
              </span>
            </li>
            <li>
              <CalendarDays size={16} />
              <span>
                Hasta el {fechaCorta(e.fin)} a las {hora(e.fin)}. Cuando termina, sale solo de la agenda.
              </span>
            </li>
          </ul>
        </div>
        <footer className="ficha-pie">
          <button className={`btn ${fav ? "btn-fav-on" : "btn-sec"}`} onClick={() => alternarFavorito(e.id)} aria-pressed={fav}>
            <Heart size={17} fill={fav ? "currentColor" : "none"} />
            {fav ? "Guardado" : "Guardar"}
          </button>
        </footer>
      </article>
    </div>
  );
}
