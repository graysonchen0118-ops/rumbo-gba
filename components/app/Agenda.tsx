"use client";

import { useMemo, useState } from "react";
import { CalendarX2, Heart, RefreshCw, WifiOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEventosVigentes } from "@/lib/vista";
import { CATEGORIAS_EVENTO, diaTexto, haceTexto, hora, mismoDia } from "@/lib/format";
import type { CategoriaEvento } from "@/lib/types";
import { Foto, Skel, Vacio } from "../ui";

type Cuando = "hoy" | "manana" | "finde" | "semana" | "todo";
const CUANDO: { id: Cuando; texto: string }[] = [
  { id: "todo", texto: "Todo" },
  { id: "hoy", texto: "Hoy" },
  { id: "manana", texto: "Mañana" },
  { id: "finde", texto: "Fin de semana" },
  { id: "semana", texto: "Próximos 7 días" },
];

export default function Agenda() {
  const { listo, ahora, abrirEvento, favoritos, agendaGuardada, actualizarAgenda, sinDatos, toast } = useStore();
  const vigentes = useEventosVigentes();
  const [cuando, setCuando] = useState<Cuando>("todo");
  const [cat, setCat] = useState<CategoriaEvento | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lista = useMemo(() => {
    const man = new Date(ahora);
    man.setDate(man.getDate() + 1);
    return vigentes.filter((e) => {
      const ini = new Date(e.inicio);
      const fin = new Date(e.fin);
      const enCurso = ini <= ahora && fin > ahora;
      if (cat && e.categoria !== cat) return false;
      if (cuando === "hoy") return mismoDia(ini, ahora) || enCurso;
      if (cuando === "manana") return mismoDia(ini, man) || (ini <= man && fin > man);
      if (cuando === "finde") {
        const dow = ini.getDay();
        return (dow === 0 || dow === 6 || dow === 5) && ini.getTime() - ahora.getTime() < 8 * 86400000;
      }
      if (cuando === "semana") return ini.getTime() - ahora.getTime() < 7 * 86400000;
      return true;
    });
  }, [vigentes, cuando, cat, ahora]);

  const grupos = useMemo(() => {
    const m = new Map<string, typeof lista>();
    lista.forEach((e) => {
      const ini = new Date(e.inicio);
      const k = ini < ahora ? "En curso" : diaTexto(e.inicio, ahora);
      m.set(k, [...(m.get(k) ?? []), e]);
    });
    return [...m.entries()];
  }, [lista, ahora]);

  const actualizar = async () => {
    setCargando(true);
    setError(null);
    try {
      await actualizarAgenda();
      toast("Agenda al día");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="agenda">
      <div className="agenda-cab">
        <div>
          <h2>Agenda</h2>
          <small className="muted">{listo ? `Actualizada ${haceTexto(agendaGuardada, ahora)}` : "Cargando"}</small>
        </div>
        <button className="btn btn-sec chico" onClick={actualizar} disabled={cargando}>
          <RefreshCw size={15} className={cargando ? "gira" : ""} />
          {cargando ? "Buscando" : "Actualizar"}
        </button>
      </div>
      {error && (
        <div className="error-caja" role="alert">
          <WifiOff size={16} />
          <span>{error}</span>
          <button className="link" onClick={() => setError(null)}>
            Entendido
          </button>
        </div>
      )}
      {sinDatos && !error && <p className="nota-aviso info">Estás viendo la agenda guardada. Los eventos que ya terminaron no aparecen.</p>}

      <div className="chips chips-cortos">
        {CUANDO.map((c) => (
          <button key={c.id} className={`chip ${cuando === c.id ? "on" : ""}`} onClick={() => setCuando(c.id)}>
            {c.texto}
          </button>
        ))}
      </div>
      <div className="chips chips-cortos">
        {(Object.keys(CATEGORIAS_EVENTO) as CategoriaEvento[]).map((c) => (
          <button key={c} className={`chip chip-sutil ${cat === c ? "on" : ""}`} onClick={() => setCat(cat === c ? null : c)}>
            {CATEGORIAS_EVENTO[c]}
          </button>
        ))}
      </div>

      {!listo ? (
        <div className="lista">
          {[0, 1, 2].map((i) => (
            <Skel key={i} h={86} r={16} />
          ))}
        </div>
      ) : grupos.length === 0 ? (
        <Vacio icono={<CalendarX2 size={22} />} titulo="Nada para esos días" texto="Probá con otra fecha o sacá el filtro de categoría." accion={<button className="btn btn-sec" onClick={() => { setCuando("todo"); setCat(null); }}>Ver toda la agenda</button>} />
      ) : (
        grupos.map(([dia, evs]) => (
          <section key={dia} className="dia">
            <h3>{dia}</h3>
            <div className="lista">
              {evs.map((e, i) => (
                <button key={e.id} className="evento" onClick={() => abrirEvento(e.id)} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <Foto k={e.foto} w={180} h={180} alt={e.titulo} className="evento-foto" />
                  <span className="item-txt">
                    <small className="evento-hora">
                      {hora(e.inicio)} · {CATEGORIAS_EVENTO[e.categoria]}
                    </small>
                    <strong>{e.titulo}</strong>
                    <small>
                      {e.lugar} · {e.precio}
                    </small>
                  </span>
                  {favoritos.includes(e.id) && <Heart size={15} className="evento-fav" fill="currentColor" />}
                </button>
              ))}
            </div>
          </section>
        ))
      )}
      <p className="pie-app">Los eventos se retiran solos de la agenda cuando terminan.</p>
    </div>
  );
}
