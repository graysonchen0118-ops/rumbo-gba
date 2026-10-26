"use client";

import { useState } from "react";
import { AlertTriangle, BusFront, Car, CarTaxiFront, Check, ChevronDown, Clock, Map as MapIcon, ShieldCheck, Smartphone, Wallet, WifiOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { ANTES_DE_SALIR, DESTINOS, OPCIONES_LLEGADA } from "@/lib/mock/transporte";
import { fechaCorta, haceTexto, pesos } from "@/lib/format";
import type { OpcionLlegada } from "@/lib/types";
import { Skel, Tilt } from "../ui";

const ICONO: Record<OpcionLlegada["tipo"], typeof BusFront> = { bus: BusFront, taxi: CarTaxiFront, app: Smartphone, colectivo: BusFront, remis: Car };

export default function Llegada() {
  const { listo, aeropuerto, setAeropuerto, destino, setDestino, vista, sinDatos, ahora, irA, setRutaVisible, pendientes } = useStore();
  const [abierta, setAbierta] = useState<string | null>("eze-taxi");
  const [hecho, setHecho] = useState<string[]>([]);
  const dest = DESTINOS.find((d) => d.id === destino) ?? DESTINOS[0];
  const opciones = OPCIONES_LLEGADA.filter((o) => o.aeropuerto === aeropuerto);
  const tarifa = (id?: string) => vista.tarifas.find((t) => t.id === id);
  const urbanas = vista.tarifas.filter((t) => t.grupo !== "aeropuerto");

  return (
    <div className="llegada">
      <Tilt className={`paquete-card ${sinDatos ? "offline" : ""}`} max={5}>
        <span className="paquete-ic">{sinDatos ? <WifiOff size={20} /> : <ShieldCheck size={20} />}</span>
        <div>
          <strong>{sinDatos ? "Funcionando sin señal" : "Guía guardada en el teléfono"}</strong>
          <small>
            Versión {vista.paquete.version} · {vista.paquete.pesoMb} MB · {listo ? `actualizada ${haceTexto(vista.paquete.publicado, ahora)}` : "..."}
          </small>
        </div>
      </Tilt>

      <div className="segmento" role="tablist" aria-label="Aeropuerto">
        <button role="tab" aria-selected={aeropuerto === "eze"} className={aeropuerto === "eze" ? "on" : ""} onClick={() => setAeropuerto("eze")}>
          Ezeiza
          <small>Internacional</small>
        </button>
        <button role="tab" aria-selected={aeropuerto === "aep"} className={aeropuerto === "aep" ? "on" : ""} onClick={() => setAeropuerto("aep")}>
          Aeroparque
          <small>Cabotaje y regionales</small>
        </button>
      </div>

      <div className="destinos">
        <span className="muted chico">Voy a</span>
        <div className="chips chips-cortos">
          {DESTINOS.map((d) => (
            <button key={d.id} className={`chip ${destino === d.id ? "on" : ""}`} onClick={() => setDestino(d.id)}>
              {d.nombre}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-sec ancho"
        onClick={() => {
          irA("mapa");
          setRutaVisible(true);
        }}
      >
        <MapIcon size={17} /> Ver el camino en el mapa
      </button>

      <div className="opciones">
        {!listo
          ? [0, 1, 2].map((i) => <Skel key={i} h={78} r={18} />)
          : opciones.map((o, i) => {
              const Ic = ICONO[o.tipo];
              const t = tarifa(o.tarifaId);
              const extra = aeropuerto === "eze" ? dest.extraEze : dest.extraAep;
              const min = o.tipo === "colectivo" ? o.minutos : [o.minutos[0] + extra, o.minutos[1] + extra];
              const abiertaEsta = abierta === o.id;
              const necesitaRed = o.tipo === "app";
              return (
                <article key={o.id} className={`opcion ${abiertaEsta ? "abierta" : ""}`} style={{ animationDelay: `${i * 50}ms` }}>
                  <button className="opcion-cab" onClick={() => setAbierta(abiertaEsta ? null : o.id)} aria-expanded={abiertaEsta}>
                    <span className={`opcion-ic tipo-${o.tipo}`}>
                      <Ic size={20} />
                    </span>
                    <span className="opcion-txt">
                      <strong>{o.titulo}</strong>
                      <small>
                        <Clock size={12} /> {min[0]} a {min[1]} min
                        <span className="sep">·</span>
                        <Wallet size={12} /> {t ? pesos(t.monto) : "Variable"}
                      </small>
                      {o.destaque && <em className="destaque">{o.destaque}</em>}
                      {necesitaRed && sinDatos && (
                        <em className="destaque alerta">
                          <AlertTriangle size={11} /> Necesita conexión para pedirlo
                        </em>
                      )}
                    </span>
                    <ChevronDown size={18} className="opcion-flecha" />
                  </button>
                  {abiertaEsta && (
                    <div className="opcion-cuerpo">
                      <p>
                        <b>Dónde:</b> {o.donde}
                      </p>
                      <p>
                        <b>Pago:</b> {o.pago}
                      </p>
                      {t && (
                        <p className="muted chico">
                          {t.nombre}: {pesos(t.monto)}, tarifa del {fechaCorta(t.actualizada)}
                        </p>
                      )}
                      {!t && o.precioTexto && <p className="muted chico">{o.precioTexto}</p>}
                      <ol className="pasos">
                        {o.pasos.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ol>
                      {o.nota && (
                        <p className="nota-aviso">
                          <AlertTriangle size={14} /> {o.nota}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
      </div>

      <section className="seccion">
        <div className="sec-tit">
          <h2>Antes de salir del aeropuerto</h2>
          <span className="muted chico">
            {hecho.length} de {ANTES_DE_SALIR.length}
          </span>
        </div>
        <div className="checklist">
          {ANTES_DE_SALIR.map((a) => {
            const ok = hecho.includes(a.id);
            return (
              <button key={a.id} className={`check ${ok ? "ok" : ""}`} onClick={() => setHecho((h) => (ok ? h.filter((x) => x !== a.id) : [...h, a.id]))} aria-pressed={ok}>
                <span className="check-caja">{ok && <Check size={14} />}</span>
                <span>
                  <strong>{a.titulo}</strong>
                  <small>{a.texto}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="seccion">
        <div className="sec-tit">
          <h2>Tarifas para moverse</h2>
          <span className="muted chico">con SUBE</span>
        </div>
        {sinDatos && pendientes > 0 && (
          <p className="nota-aviso info">
            <WifiOff size={14} /> Hay datos nuevos del equipo esperando señal. Mientras tanto ves los guardados.
          </p>
        )}
        <div className="tabla-tarifas">
          {urbanas.map((t) => (
            <div key={t.id} className="fila-tarifa">
              <span>
                <strong>{t.nombre}</strong>
                <small>{t.detalle}</small>
              </span>
              <span className="monto">
                {pesos(t.monto)}
                <small>{fechaCorta(t.actualizada)}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
