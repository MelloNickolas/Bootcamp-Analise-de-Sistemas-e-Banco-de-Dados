import { useEffect, useMemo, useState } from 'react';
import { CalendarX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EventoCard } from '../components/EventoCard';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { useCarregar } from '../hooks/useCarregar';
import { useClientes } from '../hooks/useClientes';
import {
  chaveDia,
  formatarDiaCurto,
  formatarDiaLongo,
  formatarIntervaloSemana,
  formatarMes,
  gradeDoMes,
  hojeIso,
  inicioDoMes,
  numeroDoDia,
  somarDias,
  somarMeses
} from '../lib/datas';
import type { Cliente, Evento } from '../lib/tipos';
import EventoApi from '../services/eventoApi';

type Modo = 'dia' | 'semana' | 'mes';

const MODOS: [Modo, string][] = [
  ['dia', 'Dia'],
  ['semana', 'Semana'],
  ['mes', 'Mês']
];
const DIAS_DA_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

function agruparPorDia(eventos: Evento[]) {
  const mapa = new Map<string, Evento[]>();
  for (const evento of eventos) {
    const dia = chaveDia(evento.inicio);
    mapa.set(dia, [...(mapa.get(dia) ?? []), evento]);
  }
  return mapa;
}

export default function Calendario() {
  const [modo, setModo] = useState<Modo>('dia');
  const [data, setData] = useState(hojeIso());
  const [selecionado, setSelecionado] = useState(hojeIso()); // dia aberto na visão mensal
  const { mapa: clientes } = useClientes();

  const eventos = useCarregar(() => {
    if (modo === 'dia') return EventoApi.listarDia(data);
    if (modo === 'semana') return EventoApi.listarSemana(data);
    return EventoApi.listarMes(data);
  }, [modo, modo === 'mes' ? inicioDoMes(data) : data]);

  const porDia = useMemo(() => agruparPorDia(eventos.dados ?? []), [eventos.dados]);
  const grupos = useMemo(() => [...porDia.entries()].sort(([a], [b]) => a.localeCompare(b)), [porDia]);

  // Ao trocar de mês, o dia aberto acompanha (hoje, se o mês for o atual)
  useEffect(() => {
    if (modo !== 'mes') return;
    if (selecionado.slice(0, 7) !== data.slice(0, 7)) {
      setSelecionado(data.slice(0, 7) === hojeIso().slice(0, 7) ? hojeIso() : inicioDoMes(data));
    }
  }, [modo, data, selecionado]);

  function andar(direcao: 1 | -1) {
    if (modo === 'mes') setData(somarMeses(data, direcao));
    else setData(somarDias(data, direcao * (modo === 'dia' ? 1 : 7)));
  }

  const titulo = modo === 'dia' ? formatarDiaLongo(data) : modo === 'semana' ? formatarIntervaloSemana(data) : formatarMes(data);
  const hoje = hojeIso();
  const noPresente = modo === 'mes' ? data.slice(0, 7) === hoje.slice(0, 7) : data === hoje;

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Calendário</h1>

      <div role="group" aria-label="Modo de visualização" className="mt-4 grid grid-cols-3 rounded-full border border-line p-1">
        {MODOS.map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={modo === valor}
            onClick={() => setModo(valor)}
            className={`min-h-11 rounded-full text-sm font-semibold transition-colors duration-200 ${
              modo === valor ? 'bg-accent text-accent-ink' : 'text-muted'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" className="btn-suave !px-3" aria-label="Anterior" onClick={() => andar(-1)}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-bold first-letter:uppercase" aria-live="polite">
            {titulo}
          </p>
          {!noPresente && (
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-accent-text"
              onClick={() => {
                setData(hoje);
                setSelecionado(hoje);
              }}
            >
              Voltar para hoje
            </button>
          )}
        </div>
        <button type="button" className="btn-suave !px-3" aria-label="Próximo" onClick={() => andar(1)}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {modo === 'mes' && (
        <GradeMensal data={data} hoje={hoje} selecionado={selecionado} porDia={porDia} clientes={clientes} aoEscolher={(dia) => { setSelecionado(dia); setData(dia); }} />
      )}

      <section className="mt-4" aria-live="polite">
        {eventos.carregando && <Esqueleto quantidade={3} />}
        {eventos.erro && <EstadoErro mensagem={eventos.erro} aoTentar={eventos.recarregar} />}

        {modo === 'mes' ? (
          !eventos.carregando && !eventos.erro && (
            <DiaDoMes dia={selecionado} eventos={porDia.get(selecionado) ?? []} clientes={clientes} />
          )
        ) : (
          <>
            {!eventos.carregando && !eventos.erro && grupos.length === 0 && (
              <EstadoVazio
                icone={<CalendarX size={32} aria-hidden="true" />}
                titulo={modo === 'dia' ? 'Dia livre' : 'Semana livre'}
                texto="Nenhuma gravação marcada para este período."
              />
            )}
            {!eventos.carregando &&
              grupos.map(([dia, lista]) => (
                <div key={dia} className="mb-5">
                  {modo === 'semana' && <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{formatarDiaCurto(dia)}</h2>}
                  <ul className="space-y-3">
                    {lista.map((evento, i) => (
                      <EventoCard key={evento.id} evento={evento} cliente={evento.clienteID ? clientes.get(evento.clienteID) : undefined} indice={i} />
                    ))}
                  </ul>
                </div>
              ))}
          </>
        )}
      </section>
    </>
  );
}

/* ------------------------------ visão mensal ------------------------------ */

function GradeMensal({
  data,
  hoje,
  selecionado,
  porDia,
  clientes,
  aoEscolher
}: {
  data: string;
  hoje: string;
  selecionado: string;
  porDia: Map<string, Evento[]>;
  clientes: Map<number, Cliente>;
  aoEscolher: (dia: string) => void;
}) {
  const mes = data.slice(0, 7);
  const dias = gradeDoMes(data);

  return (
    <div className="cartao entra mt-4 p-2" role="group" aria-label={`Dias de ${formatarMes(data)}`}>
      <div className="grid grid-cols-7 pb-1 text-center text-xs font-semibold uppercase text-muted" aria-hidden="true">
        {DIAS_DA_SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {dias.map((dia) => {
          const doMes = dia.slice(0, 7) === mes;
          const lista = doMes ? (porDia.get(dia) ?? []) : [];
          const ativo = dia === selecionado;
          return (
            <button
              key={dia}
              type="button"
              aria-pressed={ativo}
              aria-label={`${formatarDiaLongo(dia)}${lista.length ? `, ${lista.length} ${lista.length === 1 ? 'gravação' : 'gravações'}` : ''}`}
              onClick={() => aoEscolher(dia)}
              className={`flex min-h-12 flex-col items-center justify-start gap-1 rounded-2xl pt-1.5 text-sm transition-colors duration-150 ${
                ativo ? 'bg-accent font-bold text-accent-ink' : doMes ? 'font-semibold' : 'text-muted opacity-50'
              } ${dia === hoje && !ativo ? 'ring-2 ring-accent-text/60' : ''}`}
            >
              <span className="tabular-nums leading-none">{numeroDoDia(dia)}</span>
              <span className="flex h-2.5 items-center gap-0.5" aria-hidden="true">
                {lista.slice(0, 3).map((evento) => (
                  <span
                    key={evento.id}
                    className="size-2 rounded-full"
                    style={{ background: evento.clienteID && clientes.get(evento.clienteID) ? clientes.get(evento.clienteID)!.cor : `var(--st-${evento.status})`, boxShadow: ativo ? '0 0 0 1px rgb(32 37 45 / 0.5)' : undefined }}
                  />
                ))}
                {lista.length > 3 && <span className="text-[10px] leading-none">+</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DiaDoMes({ dia, eventos, clientes }: { dia: string; eventos: Evento[]; clientes: Map<number, Cliente> }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{formatarDiaCurto(dia)}</h2>
      {eventos.length === 0 ? (
        <EstadoVazio icone={<CalendarX size={32} aria-hidden="true" />} titulo="Dia livre" texto="Nenhuma gravação marcada para este dia." />
      ) : (
        <ul className="space-y-3">
          {eventos.map((evento, i) => (
            <EventoCard key={evento.id} evento={evento} cliente={evento.clienteID ? clientes.get(evento.clienteID) : undefined} indice={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
