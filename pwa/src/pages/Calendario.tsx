import { useMemo, useState } from 'react';
import { CalendarX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EventoCard } from '../components/EventoCard';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { useCarregar } from '../hooks/useCarregar';
import { chaveDia, formatarDiaCurto, formatarDiaLongo, formatarIntervaloSemana, hojeIso, somarDias } from '../lib/datas';
import type { Evento } from '../lib/tipos';
import EventoApi from '../services/eventoApi';

type Modo = 'dia' | 'semana';

export default function Calendario() {
  const [modo, setModo] = useState<Modo>('dia');
  const [data, setData] = useState(hojeIso());

  const eventos = useCarregar(
    () => (modo === 'dia' ? EventoApi.listarDia(data) : EventoApi.listarSemana(data)),
    [modo, data]
  );

  const passo = modo === 'dia' ? 1 : 7;
  const titulo = modo === 'dia' ? formatarDiaLongo(data) : formatarIntervaloSemana(data);

  // No modo semana, agrupa os eventos por dia
  const grupos = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    for (const evento of eventos.dados ?? []) {
      const dia = chaveDia(evento.inicio);
      mapa.set(dia, [...(mapa.get(dia) ?? []), evento]);
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [eventos.dados]);

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Calendário</h1>

      <div role="group" aria-label="Modo de visualização" className="mt-4 grid grid-cols-2 rounded-full border border-line p-1">
        {(['dia', 'semana'] as Modo[]).map((opcao) => (
          <button
            key={opcao}
            type="button"
            aria-pressed={modo === opcao}
            onClick={() => setModo(opcao)}
            className={`min-h-11 rounded-full text-sm font-semibold capitalize transition-colors duration-200 ${
              modo === opcao ? 'bg-accent text-accent-ink' : 'text-muted'
            }`}
          >
            {opcao}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" className="btn-suave !px-3" aria-label="Anterior" onClick={() => setData(somarDias(data, -passo))}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-bold first-letter:uppercase" aria-live="polite">
            {titulo}
          </p>
          {data !== hojeIso() && (
            <button type="button" className="min-h-11 text-sm font-semibold text-accent-text" onClick={() => setData(hojeIso())}>
              Voltar para hoje
            </button>
          )}
        </div>
        <button type="button" className="btn-suave !px-3" aria-label="Próximo" onClick={() => setData(somarDias(data, passo))}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <section className="mt-4" aria-live="polite">
        {eventos.carregando && <Esqueleto quantidade={3} />}
        {eventos.erro && <EstadoErro mensagem={eventos.erro} aoTentar={eventos.recarregar} />}
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
                  <EventoCard key={evento.id} evento={evento} indice={i} />
                ))}
              </ul>
            </div>
          ))}
      </section>
    </>
  );
}
