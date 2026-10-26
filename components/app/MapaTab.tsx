"use client";

import { ArrowRight, LocateFixed, Minus, PlaneLanding, Plus, Route, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePublicados } from "@/lib/vista";
import { CATEGORIAS, distanciaTexto, km } from "@/lib/format";
import { DESTINOS, RECORRIDOS } from "@/lib/mock/transporte";
import { AEROPUERTOS } from "../three/geo";
import type { Categoria } from "@/lib/types";
import { MapaGBA } from "../three/Scenes";
import { Foto, Nota } from "../ui";

const zoom = (f: number) => window.dispatchEvent(new CustomEvent("rumbo:zoom", { detail: f }));

export default function MapaTab() {
  const s = useStore();
  const { foco, enfocar, abrirLugar, favoritos, sinDatos, filtros, setFiltros, recorrido, setRecorrido, rutaVisible, setRutaVisible, aeropuerto, destino, irA, ubicacion, vista } = s;
  const publicados = usePublicados();
  const sel = foco ? publicados.find((l) => l.id === foco) : null;
  const rec = recorrido ? RECORRIDOS.find((r) => r.id === recorrido) : null;
  const dest = DESTINOS.find((d) => d.id === destino);
  const alternarCat = (c: Categoria) => setFiltros({ cats: filtros.cats.includes(c) ? filtros.cats.filter((x) => x !== c) : [...filtros.cats, c] });

  return (
    <div className="mapa-tab">
      <MapaGBA
        modo="app"
        lugares={publicados}
        favoritos={favoritos}
        foco={foco}
        fotoFoco={null}
        sinDatos={sinDatos}
        ruta={rutaVisible ? aeropuerto : null}
        destino={rutaVisible && dest ? dest : null}
        recorrido={rec ? rec.paradas : null}
        cats={filtros.cats}
        onPin={(id) => enfocar(id)}
      />
      <div className="mapa-chips">
        {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
          <button key={c} className={`chip chip-mapa ${filtros.cats.includes(c) ? "on" : ""}`} onClick={() => alternarCat(c)} style={{ ["--c" as string]: CATEGORIAS[c].color }}>
            <i />
            {CATEGORIAS[c].nombre}
          </button>
        ))}
      </div>
      <div className="mapa-zoom">
        <button className="icon-btn" onClick={() => zoom(0.75)} aria-label="Acercar">
          <Plus size={18} />
        </button>
        <button className="icon-btn" onClick={() => zoom(1.33)} aria-label="Alejar">
          <Minus size={18} />
        </button>
        <button
          className="icon-btn"
          onClick={() => {
            enfocar(null);
            zoom(0);
          }}
          aria-label="Ver todo el mapa"
        >
          <LocateFixed size={18} />
        </button>
      </div>
      {sinDatos && <span className="mapa-guardado">Mapa guardado en el teléfono, versión {vista.paquete.version}</span>}

      <div className="mapa-hoja">
        {sel ? (
          <div className="mapa-card aparece-abajo" key={sel.id}>
            <Foto k={sel.fotos[0]} w={160} h={160} alt={sel.nombre} className="mapa-card-foto" />
            <div className="mapa-card-txt">
              <small style={{ color: CATEGORIAS[sel.categoria].color }}>{CATEGORIAS[sel.categoria].nombre}</small>
              <strong>{sel.nombre}</strong>
              <small>
                <Nota v={sel.valoracion} /> · {distanciaTexto(km(ubicacion, sel))} · {sel.barrio}
              </small>
            </div>
            <div className="mapa-card-acc">
              <button className="btn btn-pri chico" onClick={() => abrirLugar(sel.id)}>
                Ver ficha
              </button>
              <button className="icon-btn" onClick={() => enfocar(null)} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
          </div>
        ) : rec ? (
          <div className="mapa-card mapa-card-rec aparece-abajo" key={rec.id}>
            <div className="mapa-card-txt">
              <small>
                <Route size={12} /> Recorrido sugerido · {rec.duracion}
              </small>
              <strong>{rec.titulo}</strong>
              <ol className="paradas">
                {rec.paradas.map((id) => {
                  const l = publicados.find((x) => x.id === id);
                  return l ? (
                    <li key={id}>
                      <button onClick={() => enfocar(id)}>{l.nombre}</button>
                    </li>
                  ) : null;
                })}
              </ol>
            </div>
            <button className="icon-btn" onClick={() => setRecorrido(null)} aria-label="Cerrar recorrido">
              <X size={16} />
            </button>
          </div>
        ) : rutaVisible ? (
          <div className="mapa-card mapa-card-ruta aparece-abajo">
            <PlaneLanding size={20} />
            <div className="mapa-card-txt">
              <small>Camino desde el aeropuerto</small>
              <strong>
                {AEROPUERTOS[aeropuerto].nombre} a {dest?.nombre}
              </strong>
            </div>
            <button className="btn btn-sec chico" onClick={() => irA("llegada")}>
              Opciones <ArrowRight size={14} />
            </button>
            <button className="icon-btn" onClick={() => setRutaVisible(false)} aria-label="Ocultar camino">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="mapa-ayuda">Tocá un punto para ver el lugar. Arrastrá para moverte y usá los botones para acercar.</div>
        )}
      </div>
    </div>
  );
}
