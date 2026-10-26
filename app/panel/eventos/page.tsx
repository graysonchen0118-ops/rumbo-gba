"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { ErrorValidacion, useStore } from "@/lib/store";
import { BARRIOS } from "@/lib/mock/barrios";
import { CATEGORIAS_EVENTO, fechaCorta, hora, norm, uid } from "@/lib/format";
import type { CategoriaEvento, Evento, Idioma } from "@/lib/types";
import { Foto, Modal, Skel, Vacio } from "@/components/ui";

type Estado = "borrador" | "proximo" | "en-curso" | "vence-hoy" | "vencido";
const ETIQUETA: Record<Estado, { t: string; c: string }> = {
  borrador: { t: "Borrador", c: "gris" },
  proximo: { t: "Próximo", c: "info" },
  "en-curso": { t: "En curso", c: "ok" },
  "vence-hoy": { t: "Vence hoy", c: "aviso" },
  vencido: { t: "Retirado solo", c: "apagado" },
};

const FOTOS = ["tango", "milonga", "concierto", "usina", "teatro-colon-2", "avenida-noche", "san-telmo-2", "feria", "gauchos", "museo", "kayak", "cerveza", "jacarandas", "reserva", "bombonera", "atardecer"];

const aLocal = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function EventosPanel() {
  const { listo, eventos, ahora, guardarEvento, eliminarEvento, toast } = useStore();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");
  const [editando, setEditando] = useState<{ e: Evento; nuevo: boolean } | null>(null);
  const [borrar, setBorrar] = useState<Evento | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const estadoDe = (e: Evento): Estado => {
    if (e.estado === "borrador") return "borrador";
    const ini = new Date(e.inicio);
    const fin = new Date(e.fin);
    if (fin <= ahora) return "vencido";
    if (fin.toDateString() === ahora.toDateString()) return "vence-hoy";
    if (ini <= ahora) return "en-curso";
    return "proximo";
  };

  const lista = useMemo(() => {
    const t = norm(q);
    return eventos
      .map((e) => ({ e, s: estadoDe(e) }))
      .filter(({ e, s }) => (filtro === "todos" ? true : s === filtro) && (t ? norm(`${e.titulo} ${e.lugar} ${e.barrio}`).includes(t) : true))
      .sort((a, b) => a.e.inicio.localeCompare(b.e.inicio));
  }, [eventos, q, filtro, ahora]);

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    eventos.forEach((e) => {
      const s = estadoDe(e);
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [eventos, ahora]);

  const nuevo = (): Evento => {
    const ini = new Date(ahora);
    ini.setDate(ini.getDate() + 3);
    ini.setHours(19, 0, 0, 0);
    const fin = new Date(ini);
    fin.setHours(22, 0, 0, 0);
    return { id: uid("ev"), titulo: "", categoria: "musica", lugar: "", barrio: BARRIOS[0].nombre, lat: BARRIOS[0].lat, lon: BARRIOS[0].lon, inicio: ini.toISOString(), fin: fin.toISOString(), precio: "Gratis", foto: "concierto", texto: { es: "" }, estado: "publicado" };
  };

  return (
    <div className="pn-pagina">
      <div className="pn-titulo fila">
        <div>
          <h1>Eventos</h1>
          <p className="muted">Cada evento tiene fecha de fin. Cuando pasa, sale solo de la agenda de la app.</p>
        </div>
        <button className="btn btn-pri" onClick={() => setEditando({ e: nuevo(), nuevo: true })}>
          <CalendarPlus size={16} /> Nuevo evento
        </button>
      </div>

      <div className="pn-estados">
        {(["todos", "proximo", "en-curso", "vence-hoy", "vencido", "borrador"] as const).map((s) => (
          <button key={s} className={`chip ${filtro === s ? "on" : ""}`} onClick={() => setFiltro(s)}>
            {s === "todos" ? "Todos" : ETIQUETA[s].t}
            <small>{s === "todos" ? eventos.length : conteo[s] ?? 0}</small>
          </button>
        ))}
        <label className="pn-buscar">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar evento o lugar" aria-label="Buscar eventos" />
        </label>
      </div>

      {!listo ? (
        <div className="pn-tabla">
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} h={64} r={12} />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Vacio icono={<Search size={22} />} titulo="No hay eventos acá" texto="Probá con otro estado o cargá uno nuevo." />
      ) : (
        <div className="pn-tabla">
          {lista.map(({ e, s }, i) => (
            <div key={e.id} className={`pn-fila pn-fila-ev aparece ${s === "vencido" ? "apagada" : ""}`} style={{ animationDelay: `${i * 22}ms` }}>
              <span className="pn-lugar">
                <Foto k={e.foto} w={96} h={96} alt={e.titulo} className="pn-mini" />
                <span>
                  <strong>{e.titulo}</strong>
                  <small>
                    {CATEGORIAS_EVENTO[e.categoria]} · {e.lugar}
                  </small>
                </span>
              </span>
              <span>
                {fechaCorta(e.inicio)} {hora(e.inicio)}
                <small>
                  hasta {fechaCorta(e.fin)} {hora(e.fin)}
                </small>
              </span>
              <span>
                <em className={`badge ${ETIQUETA[s].c}`}>{ETIQUETA[s].t}</em>
              </span>
              <span className="pn-acciones">
                <button className="icon-btn" aria-label={`Editar ${e.titulo}`} onClick={() => setEditando({ e, nuevo: false })}>
                  <Pencil size={16} />
                </button>
                <button className="icon-btn peligro" aria-label={`Eliminar ${e.titulo}`} onClick={() => setBorrar(e)}>
                  <Trash2 size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <FormEvento
          inicial={editando.e}
          nuevo={editando.nuevo}
          onClose={() => setEditando(null)}
          onGuardar={async (e) => {
            await guardarEvento(e, editando.nuevo);
            toast(editando.nuevo ? `${e.titulo} ya está en la agenda` : `Cambios guardados en ${e.titulo}`);
            setEditando(null);
          }}
        />
      )}

      <Modal
        abierto={!!borrar}
        titulo="Eliminar evento"
        onClose={() => setBorrar(null)}
        ancho={420}
        pie={
          <>
            <button className="btn btn-sec" onClick={() => setBorrar(null)}>
              Cancelar
            </button>
            <button
              className="btn btn-peligro"
              disabled={ocupado}
              onClick={async () => {
                if (!borrar) return;
                setOcupado(true);
                await eliminarEvento(borrar.id);
                setOcupado(false);
                toast(`${borrar.titulo} eliminado`, "info");
                setBorrar(null);
              }}
            >
              {ocupado ? <Loader2 size={15} className="gira" /> : <Trash2 size={15} />} Eliminar
            </button>
          </>
        }
      >
        <p>
          <b>{borrar?.titulo}</b> sale de la agenda ahora mismo. Si solo terminó, no hace falta borrarlo: la app ya lo retiró sola.
        </p>
      </Modal>
    </div>
  );
}

function FormEvento({ inicial, nuevo, onClose, onGuardar }: { inicial: Evento; nuevo: boolean; onClose: () => void; onGuardar: (e: Evento) => Promise<void> }) {
  const [e, setE] = useState<Evento>(inicial);
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const set = (p: Partial<Evento>) => setE((x) => ({ ...x, ...p }));

  const guardar = async () => {
    setError(null);
    setGuardando(true);
    try {
      await onGuardar(e);
    } catch (err) {
      setError(err instanceof ErrorValidacion ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto
      titulo={nuevo ? "Nuevo evento" : `Editar ${inicial.titulo}`}
      onClose={onClose}
      ancho={660}
      pie={
        <>
          <button className="btn btn-sec" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-pri" onClick={guardar} disabled={guardando}>
            {guardando && <Loader2 size={15} className="gira" />}
            {guardando ? "Guardando" : nuevo ? "Cargar evento" : "Guardar cambios"}
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
            Título
            <input value={e.titulo} onChange={(x) => set({ titulo: x.target.value })} placeholder="Por ejemplo, Milonga en la plaza" />
          </label>
          <label>
            Categoría
            <select value={e.categoria} onChange={(x) => set({ categoria: x.target.value as CategoriaEvento })}>
              {(Object.keys(CATEGORIAS_EVENTO) as CategoriaEvento[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIAS_EVENTO[c]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-fila">
          <label>
            Lugar
            <input value={e.lugar} onChange={(x) => set({ lugar: x.target.value })} placeholder="Sala, plaza o dirección" />
          </label>
          <label>
            Barrio o partido
            <select
              value={e.barrio}
              onChange={(x) => {
                const b = BARRIOS.find((y) => y.nombre === x.target.value)!;
                set({ barrio: b.nombre, lat: b.lat, lon: b.lon });
              }}
            >
              {BARRIOS.map((b) => (
                <option key={b.nombre} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-fila tres">
          <label>
            Empieza
            <input type="datetime-local" value={aLocal(e.inicio)} onChange={(x) => x.target.value && set({ inicio: new Date(x.target.value).toISOString() })} />
          </label>
          <label>
            Termina y sale de la agenda
            <input type="datetime-local" value={aLocal(e.fin)} onChange={(x) => x.target.value && set({ fin: new Date(x.target.value).toISOString() })} />
          </label>
          <label>
            Precio
            <input value={e.precio} onChange={(x) => set({ precio: x.target.value })} />
          </label>
        </div>
        <div className="form-idiomas">
          <div className="idiomas">
            {(["es", "en", "pt"] as Idioma[]).map((x) => (
              <button key={x} type="button" className={`idioma ${idioma === x ? "on" : ""} ${e.texto[x] ? "" : "falta"}`} onClick={() => setIdioma(x)}>
                {x === "es" ? "Español" : x === "en" ? "Inglés" : "Portugués"}
              </button>
            ))}
          </div>
          <textarea rows={3} value={e.texto[idioma] ?? ""} onChange={(x) => set({ texto: { ...e.texto, [idioma]: x.target.value || undefined } })} placeholder="Qué pasa, a qué hora conviene llegar y si hay que reservar" />
        </div>
        <div className="form-fotos">
          <span>Foto</span>
          <div className="fotos-grilla">
            {FOTOS.map((f) => (
              <button key={f} type="button" className={`foto-op ${e.foto === f ? "on" : ""}`} onClick={() => set({ foto: f })} aria-pressed={e.foto === f}>
                <Foto k={f} w={160} h={120} alt={f} />
              </button>
            ))}
          </div>
        </div>
        <label className="fila-check">
          <input type="checkbox" checked={e.estado === "publicado"} onChange={(x) => set({ estado: x.target.checked ? "publicado" : "borrador" })} />
          Publicar en la agenda al guardar
        </label>
      </div>
    </Modal>
  );
}
