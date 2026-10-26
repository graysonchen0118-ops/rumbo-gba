"use client";

import { ArrowRight, Clock, Footprints, MapPin, PlaneLanding, Route, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useEventosVigentes, useLugaresFiltrados, usePublicados } from "@/lib/vista";
import { abiertoAhora, CATEGORIAS, diaTexto, diasDesde, distanciaTexto, hora, km, PRECIO, saludo, ZONAS } from "@/lib/format";
import { RECORRIDOS } from "@/lib/mock/transporte";
import type { Categoria, Zona } from "@/lib/types";
import { Foto, Nota, Skel, Tilt, Vacio } from "../ui";
import { MapaGBA } from "../three/Scenes";

export default function Explorar({ marco }: { marco: boolean }) {
  const s = useStore();
  const { listo, filtros, setFiltros, limpiarFiltros, ubicacion, ahora, abrirLugar, abrirEvento, irA, setRecorrido, favoritos, sinDatos, vista } = s;
  const resultados = useLugaresFiltrados();
  const publicados = usePublicados();
  const eventos = useEventosVigentes();
  const [verFiltros, setVerFiltros] = useState(false);
  const buscando = filtros.q.trim() !== "" || filtros.cats.length > 0 || filtros.zona !== "todas" || filtros.precio !== "todos" || filtros.abierto;

  const cerca = useMemo(
    () =>
      publicados
        .map((l) => ({ l, d: km(ubicacion, l) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 8),
    [publicados, ubicacion],
  );
  const semana = useMemo(() => eventos.filter((e) => new Date(e.inicio).getTime() - ahora.getTime() < 7 * 86400000).slice(0, 4), [eventos, ahora]);
  const verificados = useMemo(() => publicados.filter((l) => diasDesde(l.verificado, ahora) <= 7).sort((a, b) => b.verificado.localeCompare(a.verificado)).slice(0, 6), [publicados, ahora]);

  const alternarCat = (c: Categoria) => setFiltros({ cats: filtros.cats.includes(c) ? filtros.cats.filter((x) => x !== c) : [...filtros.cats, c] });

  return (
    <div className="explorar">
      <section className={`hero ${marco ? "hero-foto" : "hero-3d"}`}>
        {marco ? (
          <div className="hero-capas">
            <Foto k="avenida-noche" w={780} h={520} alt="La avenida 9 de Julio al atardecer, con el Obelisco al fondo" eager className="hero-fondo" />
            <div className="hero-velo" />
          </div>
        ) : (
          <div className="hero-mapa">
            <MapaGBA modo="hero" lugares={publicados} favoritos={favoritos} foco={null} sinDatos={sinDatos} ruta={null} />
          </div>
        )}
        <div className="hero-txt">
          <small>{listo ? saludo(ahora) : "Hola"}, cerca de {ubicacion.nombre}</small>
          <h1>¿Qué hacemos hoy en Buenos Aires?</h1>
        </div>
      </section>

      <div className="buscador">
        <Search size={18} />
        <input value={filtros.q} onChange={(e) => setFiltros({ q: e.target.value })} placeholder="Buscar lugares, barrios, comidas" aria-label="Buscar" />
        {filtros.q && (
          <button className="icon-btn chico" onClick={() => setFiltros({ q: "" })} aria-label="Borrar búsqueda">
            <X size={16} />
          </button>
        )}
        <button className={`icon-btn chico ${verFiltros ? "on" : ""}`} onClick={() => setVerFiltros((v) => !v)} aria-label="Filtros" aria-expanded={verFiltros}>
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="chips">
        {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
          <button key={c} className={`chip ${filtros.cats.includes(c) ? "on" : ""}`} onClick={() => alternarCat(c)} style={{ ["--c" as string]: CATEGORIAS[c].color }}>
            <i />
            {CATEGORIAS[c].nombre}
          </button>
        ))}
      </div>

      {verFiltros && (
        <div className="filtros-panel">
          <label>
            Zona
            <select value={filtros.zona} onChange={(e) => setFiltros({ zona: e.target.value as Zona | "todas" })}>
              <option value="todas">Todo el Gran Buenos Aires</option>
              {(Object.keys(ZONAS) as Zona[]).map((z) => (
                <option key={z} value={z}>
                  {ZONAS[z]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio
            <select value={filtros.precio} onChange={(e) => setFiltros({ precio: e.target.value as typeof filtros.precio })}>
              <option value="todos">Cualquier precio</option>
              <option value="gratis">Solo gratis</option>
              <option value="economico">Gratis o económico</option>
            </select>
          </label>
          <label>
            Ordenar
            <select value={filtros.orden} onChange={(e) => setFiltros({ orden: e.target.value as typeof filtros.orden })}>
              <option value="cerca">Más cerca primero</option>
              <option value="valoracion">Mejor valorados</option>
              <option value="nombre">Por nombre</option>
            </select>
          </label>
          <label className="fila-check">
            <input type="checkbox" checked={filtros.abierto} onChange={(e) => setFiltros({ abierto: e.target.checked })} />
            Abierto ahora
          </label>
        </div>
      )}

      {!listo ? (
        <div className="lista">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="item-skel">
              <Skel h={64} w={64} r={14} />
              <div>
                <Skel h={14} w="70%" />
                <Skel h={12} w="45%" />
              </div>
            </div>
          ))}
        </div>
      ) : buscando ? (
        <section className="seccion">
          <div className="sec-tit">
            <h2>
              {resultados.length} {resultados.length === 1 ? "lugar" : "lugares"}
            </h2>
            <button className="link" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>
          {resultados.length === 0 ? (
            <Vacio icono={<Search size={22} />} titulo="Nada con esos filtros" texto="Probá con otra zona o sacá el filtro de abierto ahora." accion={<button className="btn btn-sec" onClick={limpiarFiltros}>Limpiar filtros</button>} />
          ) : (
            <div className="lista">
              {resultados.map(({ l, d }, i) => (
                <button key={l.id} className="item" onClick={() => abrirLugar(l.id)} style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                  <Foto k={l.fotos[0]} w={128} h={128} alt={l.nombre} className="item-foto" />
                  <span className="item-txt">
                    <strong>{l.nombre}</strong>
                    <small>
                      <i className="punto" style={{ background: CATEGORIAS[l.categoria].color }} />
                      {CATEGORIAS[l.categoria].nombre} · {l.barrio}
                    </small>
                    <small className="item-meta">
                      <Nota v={l.valoracion} /> · {distanciaTexto(d)} · {PRECIO[l.precio]}
                      {abiertoAhora(l.horarios, ahora) ? <b className="abierto">Abierto</b> : <b className="cerrado">Cerrado</b>}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <Tilt as="button" className="promo-llegada" onClick={() => irA("llegada")}>
            <span className="promo-ic">
              <PlaneLanding size={22} />
            </span>
            <span>
              <strong>¿Recién aterrizás?</strong>
              <small>Cómo llegar desde Ezeiza o Aeroparque, guardado en el teléfono para usarlo sin señal.</small>
            </span>
            <ArrowRight size={18} />
          </Tilt>

          <section className="seccion">
            <div className="sec-tit">
              <h2>Cerca de {ubicacion.nombre}</h2>
              <button className="link" onClick={() => setFiltros({ orden: "cerca", abierto: true })}>
                Abiertos ahora
              </button>
            </div>
            <div className="carrusel">
              {cerca.map(({ l, d }, i) => (
                <Tilt key={l.id} as="button" className="tarjeta" onClick={() => abrirLugar(l.id)}>
                  <span className="tarjeta-foto">
                    <Foto k={l.fotos[0]} w={440} h={300} alt={l.nombre} eager={i < 2} />
                    <em className="tarjeta-dist">
                      <MapPin size={11} />
                      {distanciaTexto(d)}
                    </em>
                  </span>
                  <span className="tarjeta-txt">
                    <strong>{l.nombre}</strong>
                    <small>
                      {CATEGORIAS[l.categoria].nombre} · <Nota v={l.valoracion} />
                    </small>
                  </span>
                </Tilt>
              ))}
            </div>
          </section>

          <section className="seccion">
            <div className="sec-tit">
              <h2>Esta semana</h2>
              <button className="link" onClick={() => irA("agenda")}>
                Ver agenda
              </button>
            </div>
            <div className="lista">
              {semana.map((e) => (
                <button key={e.id} className="item item-evento" onClick={() => abrirEvento(e.id)}>
                  <span className="fecha-bloque">
                    <small>{diaTexto(e.inicio, ahora).split(" ")[0]}</small>
                    <strong>{hora(e.inicio)}</strong>
                  </span>
                  <span className="item-txt">
                    <strong>{e.titulo}</strong>
                    <small>
                      {e.lugar} · {e.precio}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="seccion">
            <div className="sec-tit">
              <h2>Recorridos para hacer a pie</h2>
            </div>
            <div className="carrusel">
              {RECORRIDOS.map((r) => (
                <Tilt
                  key={r.id}
                  as="button"
                  className="tarjeta tarjeta-rec"
                  onClick={() => {
                    irA("mapa");
                    setRecorrido(r.id);
                  }}
                >
                  <span className="tarjeta-foto">
                    <Foto k={r.foto} w={440} h={300} alt={r.titulo} />
                    <em className="tarjeta-dist">
                      <Route size={11} />
                      {r.paradas.length} paradas
                    </em>
                  </span>
                  <span className="tarjeta-txt">
                    <strong>{r.titulo}</strong>
                    <small>
                      <Footprints size={12} /> {r.duracion}
                    </small>
                  </span>
                </Tilt>
              ))}
            </div>
          </section>

          <section className="seccion">
            <div className="sec-tit">
              <h2>Verificados esta semana</h2>
              <span className="muted chico">
                <Sparkles size={12} /> por el equipo, en persona
              </span>
            </div>
            <div className="lista">
              {verificados.map((l) => (
                <button key={l.id} className="item" onClick={() => abrirLugar(l.id)}>
                  <Foto k={l.fotos[0]} w={128} h={128} alt={l.nombre} className="item-foto" />
                  <span className="item-txt">
                    <strong>{l.nombre}</strong>
                    <small>
                      {l.barrio} · {ZONAS[l.zona]}
                    </small>
                    <small className="item-meta">
                      <Clock size={11} /> Verificado {diasDesde(l.verificado, ahora) === 0 ? "hoy" : `hace ${diasDesde(l.verificado, ahora)} ${diasDesde(l.verificado, ahora) === 1 ? "día" : "días"}`}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <p className="pie-app">
            © 2026 Rumbo · Guía del Gran Buenos Aires · {vista.lugares.filter((l) => l.estado === "publicado").length} lugares · Fotos de Unsplash
          </p>
        </>
      )}
    </div>
  );
}
