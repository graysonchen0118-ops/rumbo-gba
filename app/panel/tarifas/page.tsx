"use client";

import { useState } from "react";
import { BusFront, Loader2, PlaneLanding, Save, Smartphone, Wifi, WifiOff } from "lucide-react";
import { ErrorValidacion, useStore } from "@/lib/store";
import { OPCIONES_LLEGADA } from "@/lib/mock/transporte";
import { fechaCorta, haceTexto, pesos } from "@/lib/format";
import type { Tarifa } from "@/lib/types";
import { Skel, Switch } from "@/components/ui";

const GRUPOS: { id: Tarifa["grupo"]; t: string }[] = [
  { id: "aeropuerto", t: "Aeropuertos" },
  { id: "colectivo", t: "Colectivo" },
  { id: "subte", t: "Subte" },
  { id: "tren", t: "Tren" },
  { id: "taxi", t: "Taxi" },
];

function FilaTarifa({ t }: { t: Tarifa }) {
  const { guardarTarifa, toast, ahora, sinDatos } = useStore();
  const [valor, setValor] = useState(String(t.monto));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cambio = Number(valor.replace(/\./g, "").replace(",", ".")) !== t.monto;

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const n = Number(valor.replace(/\./g, "").replace(",", "."));
      await guardarTarifa(t.id, n);
      toast(sinDatos ? `${t.nombre}: guardada. El teléfono de prueba la recibe al volver la señal.` : `${t.nombre}: ${pesos(n)}, ya se ve en la app`);
    } catch (e) {
      setError(e instanceof ErrorValidacion ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`pn-fila pn-fila-tarifa ${error ? "con-error" : ""}`}>
      <span>
        <strong>{t.nombre}</strong>
        <small>{t.detalle}</small>
      </span>
      <span className="muted chico">
        {fechaCorta(t.actualizada)}
        <small>{haceTexto(t.actualizada, ahora)}</small>
      </span>
      <span className="pn-monto">
        <span className="pn-peso">$</span>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cambio && guardar()}
          aria-label={`Monto de ${t.nombre}`}
          aria-invalid={!!error}
        />
      </span>
      <span className="pn-acciones">
        <button className="btn btn-pri chico" disabled={!cambio || guardando} onClick={guardar}>
          {guardando ? <Loader2 size={14} className="gira" /> : <Save size={14} />}
          Guardar
        </button>
      </span>
      {error && <small className="fila-error">{error}</small>}
    </div>
  );
}

export default function TarifasPanel() {
  const { listo, tarifas, vista, sinDatos, alternarSinDatos, pendientes } = useStore();
  const precio = (id?: string) => vista.tarifas.find((t) => t.id === id);
  const ezeiza = OPCIONES_LLEGADA.filter((o) => o.aeropuerto === "eze");

  return (
    <div className="pn-pagina">
      <div className="pn-titulo">
        <h1>Tarifas y llegada</h1>
        <p className="muted">Se corrigen una vez acá y llegan a todos los teléfonos, sin sacar otra versión de la app en las tiendas.</p>
      </div>

      <div className="pn-grid pn-grid-tarifas">
        <div className="pn-card pn-card-ancha">
          {!listo ? (
            [0, 1, 2, 3].map((i) => <Skel key={i} h={56} r={12} />)
          ) : (
            GRUPOS.map((g) => (
              <section key={g.id} className="pn-grupo">
                <h3>
                  {g.id === "aeropuerto" ? <PlaneLanding size={16} /> : <BusFront size={16} />} {g.t}
                </h3>
                {tarifas
                  .filter((t) => t.grupo === g.id)
                  .map((t) => (
                    <FilaTarifa key={t.id} t={t} />
                  ))}
              </section>
            ))
          )}
        </div>

        <aside className="pn-card vista-previa">
          <div className="pn-card-cab">
            <h2>
              <Smartphone size={18} /> Así lo ve el turista
            </h2>
          </div>
          <div className={`pn-telefono grande ${sinDatos ? "off" : ""}`}>
            {sinDatos ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>
              <strong>{sinDatos ? "Teléfono sin datos" : "Teléfono con datos"}</strong>
              <small>{sinDatos ? (pendientes ? `${pendientes} ${pendientes === 1 ? "cambio espera" : "cambios esperan"} la señal` : "Usa lo guardado") : "Recibe cada cambio al instante"}</small>
            </span>
            <Switch on={sinDatos} onChange={alternarSinDatos} label="Sin datos" />
          </div>
          <div className="mini-app">
            <small className="mini-app-tit">Llegada · Ezeiza</small>
            {ezeiza.map((o) => {
              const t = precio(o.tarifaId);
              return (
                <div key={o.id} className="mini-op">
                  <span>{o.titulo}</span>
                  <b key={t?.monto}>{t ? pesos(t.monto) : "Variable"}</b>
                </div>
              );
            })}
          </div>
          <p className="muted chico">Con el teléfono sin datos, un cambio de tarifa queda esperando: acá se ve el precio nuevo y en el teléfono aparece cuando vuelve la señal.</p>
        </aside>
      </div>
    </div>
  );
}
