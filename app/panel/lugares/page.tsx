"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ErrorValidacion, useStore } from "@/lib/store";
import { BARRIOS } from "@/lib/mock/barrios";
import { CATEGORIAS, diasDesde, fechaCorta, norm, uid, ZONAS } from "@/lib/format";
import type { Categoria, Idioma, Lugar } from "@/lib/types";
import { Foto, Modal, Skel, Vacio } from "@/components/ui";

const FOTOS_POR_CAT: Record<Categoria, string[]> = {
  atraccion: ["obelisco", "obelisco-2", "caminito", "caminito-2", "recoleta", "puente-mujer", "casa-rosada", "congreso", "floralis"],
  cultura: ["teatro-colon", "teatro-colon-2", "museo", "museo-2", "ateneo", "ateneo-2", "tango", "usina", "avenida-noche"],
  gastronomia: ["parrilla", "parrilla-2", "empanadas", "empanadas-2", "pizza", "cafe", "medialunas", "helado", "cerveza", "vino"],
  alojamiento: ["hotel-habitacion", "hotel-habitacion-2", "hotel-lobby", "hostel", "san-telmo", "kayak", "puerto-madero", "jacarandas", "calle"],
  naturaleza: ["rosedal", "lago", "jardin-japones", "reserva", "delta", "kayak", "rio", "atardecer", "jacarandas-2"],
  ferias: ["san-telmo", "san-telmo-2", "feria", "gauchos", "tigre", "street-art", "calle", "mate", "transporte"],
};

const POR_PAGINA = 10;

type Orden = "nombre" | "verificado" | "valoracion";

function vacio(): Lugar {
  return {
    id: uid("lugar"),
    nombre: "",
    categoria: "gastronomia",
    zona: "centro",
    barrio: BARRIOS[0].nombre,
    direccion: "",
    lat: BARRIOS[0].lat,
    lon: BARRIOS[0].lon,
    horarios: [{ dias: [0, 1, 2, 3, 4, 5, 6], abre: "10:00", cierra: "20:00" }],
    precio: 1,
    valoracion: 4.5,
    opiniones: 0,
    fotos: ["parrilla"],
    texto: { es: "" },
    comoLlegar: "",
    etiquetas: [],
    verificado: new Date().toISOString(),
    estado: "borrador",
  };
}

export default function LugaresPanel() {
  const { listo, lugares, ahora, guardarLugar, eliminarLugar, estadoLugar, verificarLugar, toast } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Categoria | "todas">("todas");
  const [estado, setEstado] = useState<"todos" | "publicado" | "borrador" | "revisar">("todos");
  const [orden, setOrden] = useState<Orden>("nombre");
  const [pagina, setPagina] = useState(0);
  const [editando, setEditando] = useState<{ l: Lugar; nuevo: boolean } | null>(null);
  const [borrar, setBorrar] = useState<Lugar | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const lista = useMemo(() => {
    const t = norm(q);
    const r = lugares
      .filter((l) => (cat === "todas" ? true : l.categoria === cat))
      .filter((l) => (estado === "todos" ? true : estado === "revisar" ? diasDesde(l.verificado, ahora) > 60 : l.estado === estado))
      .filter((l) => (t ? norm(`${l.nombre} ${l.barrio}`).includes(t) : true));
    r.sort((a, b) => (orden === "nombre" ? a.nombre.localeCompare(b.nombre, "es") : orden === "verificado" ? a.verificado.localeCompare(b.verificado) : b.valoracion - a.valoracion));
    return r;
  }, [lugares, q, cat, estado, orden, ahora]);

  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const pag = Math.min(pagina, paginas - 1);
  const visibles = lista.slice(pag * POR_PAGINA, pag * POR_PAGINA + POR_PAGINA);

  const accion = async (id: string, fn: () => Promise<void>, ok: string) => {
    setOcupado(id);
    try {
      await fn();
      toast(ok);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="pn-pagina">
      <div className="pn-titulo fila">
        <div>
          <h1>Lugares</h1>
          <p className="muted">
            {lugares.length} fichas, {lugares.filter((l) => l.estado === "publicado").length} publicadas en la app
          </p>
        </div>
        <button className="btn btn-pri" onClick={() => setEditando({ l: vacio(), nuevo: true })}>
          <Plus size={16} /> Nuevo lugar
        </button>
      </div>

      <div className="pn-filtros">
        <label className="pn-buscar">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar por nombre o barrio"
            aria-label="Buscar lugares"
          />
        </label>
        <select value={cat} onChange={(e) => { setCat(e.target.value as Categoria | "todas"); setPagina(0); }} aria-label="Categoría">
          <option value="todas">Todas las categorías</option>
          {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORIAS[c].nombre}
            </option>
          ))}
        </select>
        <select value={estado} onChange={(e) => { setEstado(e.target.value as typeof estado); setPagina(0); }} aria-label="Estado">
          <option value="todos">Todos los estados</option>
          <option value="publicado">Publicados</option>
          <option value="borrador">Borradores</option>
          <option value="revisar">Sin verificar hace 60 días</option>
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar">
          <option value="nombre">Por nombre</option>
          <option value="verificado">Verificación más vieja primero</option>
          <option value="valoracion">Mejor valorados</option>
        </select>
      </div>

      {!listo ? (
        <div className="pn-tabla">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skel key={i} h={58} r={12} />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Vacio icono={<Search size={22} />} titulo="Ninguna ficha coincide" texto="Cambiá los filtros o cargá un lugar nuevo." />
      ) : (
        <div className="pn-tabla">
          <div className="pn-fila pn-fila-cab">
            <span>Lugar</span>
            <span>Estado</span>
            <span>Verificado</span>
            <span>Idiomas</span>
            <span />
          </div>
          {visibles.map((l, i) => {
            const dias = diasDesde(l.verificado, ahora);
            const ocup = ocupado === l.id;
            return (
              <div key={l.id} className="pn-fila aparece" style={{ animationDelay: `${i * 25}ms` }}>
                <span className="pn-lugar">
                  <Foto k={l.fotos[0]} w={96} h={96} alt={l.nombre} className="pn-mini" />
                  <span>
                    <strong>{l.nombre}</strong>
                    <small>
                      <i className="punto" style={{ background: CATEGORIAS[l.categoria].color }} />
                      {CATEGORIAS[l.categoria].nombre} · {l.barrio}
                    </small>
                  </span>
                </span>
                <span>
                  <em className={`badge ${l.estado === "publicado" ? "ok" : "gris"}`}>{l.estado === "publicado" ? "Publicado" : "Borrador"}</em>
                </span>
                <span className={dias > 60 ? "txt-alerta" : ""}>
                  {fechaCorta(l.verificado)}
                  <small>{dias === 0 ? "hoy" : `hace ${dias} d`}</small>
                </span>
                <span className="pn-idiomas">
                  {(["es", "en", "pt"] as Idioma[]).map((x) => (
                    <i key={x} className={l.texto[x] ? "on" : ""}>
                      {x.toUpperCase()}
                    </i>
                  ))}
                </span>
                <span className="pn-acciones">
                  {ocup ? (
                    <Loader2 size={16} className="gira" />
                  ) : (
                    <>
                      <button className="icon-btn" title="Marcar verificado hoy" aria-label={`Verificar ${l.nombre}`} onClick={() => accion(l.id, () => verificarLugar(l.id), `${l.nombre} verificado hoy`)}>
                        <BadgeCheck size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        title={l.estado === "publicado" ? "Pasar a borrador" : "Publicar"}
                        aria-label={l.estado === "publicado" ? `Pasar ${l.nombre} a borrador` : `Publicar ${l.nombre}`}
                        onClick={() => accion(l.id, () => estadoLugar(l.id, l.estado === "publicado" ? "borrador" : "publicado"), l.estado === "publicado" ? `${l.nombre} salió de la app` : `${l.nombre} ya está en la app`)}
                      >
                        {l.estado === "publicado" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="icon-btn" title="Editar" aria-label={`Editar ${l.nombre}`} onClick={() => setEditando({ l, nuevo: false })}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn peligro" title="Eliminar" aria-label={`Eliminar ${l.nombre}`} onClick={() => setBorrar(l)}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </span>
              </div>
            );
          })}
          <div className="pn-paginacion">
            <span className="muted chico">
              {pag * POR_PAGINA + 1} a {Math.min(lista.length, (pag + 1) * POR_PAGINA)} de {lista.length}
            </span>
            <div>
              <button className="icon-btn" disabled={pag === 0} onClick={() => setPagina(pag - 1)} aria-label="Página anterior">
                <ChevronLeft size={16} />
              </button>
              <span className="chico">
                {pag + 1} / {paginas}
              </span>
              <button className="icon-btn" disabled={pag >= paginas - 1} onClick={() => setPagina(pag + 1)} aria-label="Página siguiente">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <FormLugar
          inicial={editando.l}
          nuevo={editando.nuevo}
          onClose={() => setEditando(null)}
          onGuardar={async (l) => {
            await guardarLugar(l, editando.nuevo);
            toast(editando.nuevo ? `${l.nombre} cargado${l.estado === "publicado" ? " y publicado en la app" : " como borrador"}` : `Cambios guardados en ${l.nombre}`);
            setEditando(null);
          }}
        />
      )}

      <Modal
        abierto={!!borrar}
        titulo="Eliminar ficha"
        onClose={() => setBorrar(null)}
        ancho={420}
        pie={
          <>
            <button className="btn btn-sec" onClick={() => setBorrar(null)}>
              Cancelar
            </button>
            <button
              className="btn btn-peligro"
              disabled={ocupado === borrar?.id}
              onClick={async () => {
                if (!borrar) return;
                setOcupado(borrar.id);
                await eliminarLugar(borrar.id);
                setOcupado(null);
                toast(`${borrar.nombre} eliminado`, "info");
                setBorrar(null);
              }}
            >
              {ocupado === borrar?.id ? <Loader2 size={15} className="gira" /> : <Trash2 size={15} />} Eliminar
            </button>
          </>
        }
      >
        <p>
          Se borra <b>{borrar?.nombre}</b> del panel y sale de la app en todos los teléfonos con señal. Si alguien lo tenía guardado, desaparece de sus guardados.
        </p>
      </Modal>
    </div>
  );
}

function FormLugar({ inicial, nuevo, onClose, onGuardar }: { inicial: Lugar; nuevo: boolean; onClose: () => void; onGuardar: (l: Lugar) => Promise<void> }) {
  const [l, setL] = useState<Lugar>(inicial);
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const set = (p: Partial<Lugar>) => setL((x) => ({ ...x, ...p }));
  const h = l.horarios?.[0];

  const guardar = async () => {
    setError(null);
    setGuardando(true);
    try {
      await onGuardar({ ...l, nombre: l.nombre.trim() });
    } catch (e) {
      setError(e instanceof ErrorValidacion ? e.message : "No se pudo guardar. Probá de nuevo en un momento.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto
      titulo={nuevo ? "Nuevo lugar" : `Editar ${inicial.nombre}`}
      onClose={onClose}
      ancho={680}
      pie={
        <>
          <button className="btn btn-sec" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-pri" onClick={guardar} disabled={guardando}>
            {guardando && <Loader2 size={15} className="gira" />}
            {guardando ? "Guardando" : nuevo ? "Cargar lugar" : "Guardar cambios"}
          </button>
        </>
      }
    >
      <div className="form">
        {error && (
          <p className="error-caja" role="alert">
            {error}
          </p>
        )}
        <div className="form-fila">
          <label>
            Nombre
            <input value={l.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Por ejemplo, Parrilla El Ombú" />
          </label>
          <label>
            Categoría
            <select value={l.categoria} onChange={(e) => set({ categoria: e.target.value as Categoria, fotos: [FOTOS_POR_CAT[e.target.value as Categoria][0]] })}>
              {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIAS[c].nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-fila">
          <label>
            Barrio o partido
            <select
              value={l.barrio}
              onChange={(e) => {
                const b = BARRIOS.find((x) => x.nombre === e.target.value)!;
                set({ barrio: b.nombre, zona: b.zona, lat: b.lat + (Math.random() - 0.5) * 0.004, lon: b.lon + (Math.random() - 0.5) * 0.004 });
              }}
            >
              {BARRIOS.map((b) => (
                <option key={b.nombre} value={b.nombre}>
                  {b.nombre} · {ZONAS[b.zona]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dirección
            <input value={l.direccion} onChange={(e) => set({ direccion: e.target.value })} placeholder="Calle y número" />
          </label>
        </div>
        <div className="form-fila tres">
          <label>
            Abre
            <input type="time" value={h?.abre ?? "10:00"} onChange={(e) => set({ horarios: [{ dias: h?.dias ?? [0, 1, 2, 3, 4, 5, 6], abre: e.target.value, cierra: h?.cierra ?? "20:00" }] })} />
          </label>
          <label>
            Cierra
            <input type="time" value={h?.cierra ?? "20:00"} onChange={(e) => set({ horarios: [{ dias: h?.dias ?? [0, 1, 2, 3, 4, 5, 6], abre: h?.abre ?? "10:00", cierra: e.target.value }] })} />
          </label>
          <label>
            Precio
            <select value={l.precio} onChange={(e) => set({ precio: Number(e.target.value) as Lugar["precio"] })}>
              <option value={0}>Gratis</option>
              <option value={1}>$</option>
              <option value={2}>$$</option>
              <option value={3}>$$$</option>
            </select>
          </label>
        </div>
        <label>
          Cómo llegar
          <input value={l.comoLlegar} onChange={(e) => set({ comoLlegar: e.target.value })} placeholder="Subte, colectivo o tren más cercano" />
        </label>

        <div className="form-idiomas">
          <div className="idiomas">
            {(["es", "en", "pt"] as Idioma[]).map((x) => (
              <button key={x} type="button" className={`idioma ${idioma === x ? "on" : ""} ${l.texto[x] ? "" : "falta"}`} onClick={() => setIdioma(x)}>
                {x === "es" ? "Español" : x === "en" ? "Inglés" : "Portugués"}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={l.texto[idioma] ?? ""}
            onChange={(e) => set({ texto: { ...l.texto, [idioma]: e.target.value || undefined } })}
            placeholder={idioma === "es" ? "Qué es, por qué ir y un consejo práctico" : "Si queda vacío, la app muestra el texto en español"}
          />
        </div>

        <div className="form-fotos">
          <span>Fotos de la ficha (hasta tres)</span>
          <div className="fotos-grilla">
            {FOTOS_POR_CAT[l.categoria].map((f) => {
              const on = l.fotos.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  className={`foto-op ${on ? "on" : ""}`}
                  onClick={() => set({ fotos: on ? (l.fotos.length > 1 ? l.fotos.filter((x) => x !== f) : l.fotos) : [...l.fotos, f].slice(-3) })}
                  aria-pressed={on}
                >
                  <Foto k={f} w={160} h={120} alt={f} />
                </button>
              );
            })}
          </div>
        </div>

        <label className="fila-check">
          <input type="checkbox" checked={l.estado === "publicado"} onChange={(e) => set({ estado: e.target.checked ? "publicado" : "borrador" })} />
          Publicar en la app al guardar
        </label>
      </div>
    </Modal>
  );
}
