import { useEffect, useMemo, useState } from 'react';
import { CalendarX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EventoCard } from '../components/EventoCard';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { VideoCard } from '../components/VideoCard';
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
  inicioDaSemana,
  inicioDoMes,
  numeroDoDia,
  somarDias,
  somarMeses
} from '../lib/datas';
import type { Cliente, Evento, Video } from '../lib/tipos';
import EventoApi from '../services/eventoApi';
import VideoApi from '../services/videoApi';

type Modo = 'mes' | 'semana';
type Papel = 'edicao' | 'entrega' | 'edicao_entrega';
interface ItemVideo {
  video: Video;
  papel: Papel;
}

const MODOS: [Modo, string][] = [
  ['mes', 'Mês'],
  ['semana', 'Semana']
];
const DIAS_DA_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const ROTULO_DO_PAPEL: Record<Papel, string> = {
  edicao: 'Prazo de edição',
  entrega: 'Entrega',
  edicao_entrega: 'Edição e entrega'
};

function agruparEventos(eventos: Evento[]) {
  const mapa = new Map<string, Evento[]>();
  for (const evento of eventos) {
    const dia = chaveDia(evento.inicio);
    mapa.set(dia, [...(mapa.get(dia) ?? []), evento]);
  }
  return mapa;
}

// Cada vídeo aparece no dia do prazo de edição e no dia da entrega (um só item se forem o mesmo dia)
function agruparVideos(videos: Video[]) {
  const mapa = new Map<string, ItemVideo[]>();
  const colocar = (dia: string, item: ItemVideo) => mapa.set(dia, [...(mapa.get(dia) ?? []), item]);
  for (const video of videos) {
    const diaEdicao = chaveDia(video.prazoEdicao);
    const diaEntrega = chaveDia(video.prazoEntrega);
    if (diaEdicao === diaEntrega) colocar(diaEdicao, { video, papel: 'edicao_entrega' });
    else {
      colocar(diaEdicao, { video, papel: 'edicao' });
      colocar(diaEntrega, { video, papel: 'entrega' });
    }
  }
  return mapa;
}

export default function Calendario() {
  const [modo, setModo] = useState<Modo>('mes');
  const [data, setData] = useState(hojeIso());
  const [selecionado, setSelecionado] = useState(hojeIso()); // dia aberto na visão mensal
  const { mapa: clientes } = useClientes();

  const eventos = useCarregar(
    () => (modo === 'semana' ? EventoApi.listarSemana(data) : EventoApi.listarMes(data)),
    [modo, modo === 'mes' ? inicioDoMes(data) : data]
  );
  const videos = useCarregar(() => VideoApi.listar(), []);

  const eventosPorDia = useMemo(() => agruparEventos(eventos.dados ?? []), [eventos.dados]);
  const videosPorDia = useMemo(() => agruparVideos(videos.dados ?? []), [videos.dados]);

  // Ao trocar de mês, o dia aberto acompanha (hoje, se o mês for o atual)
  useEffect(() => {
    if (modo !== 'mes') return;
    if (selecionado.slice(0, 7) !== data.slice(0, 7)) {
      setSelecionado(data.slice(0, 7) === hojeIso().slice(0, 7) ? hojeIso() : inicioDoMes(data));
    }
  }, [modo, data, selecionado]);

  function andar(direcao: 1 | -1) {
    setData(modo === 'mes' ? somarMeses(data, direcao) : somarDias(data, direcao * 7));
  }

  const titulo = modo === 'mes' ? formatarMes(data) : formatarIntervaloSemana(data);
  const hoje = hojeIso();
  const noPresente = modo === 'mes' ? data.slice(0, 7) === hoje.slice(0, 7) : data === hoje;

  // Dias da semana que têm gravação ou prazo de vídeo
  const diasDaSemana = useMemo(() => {
    if (modo !== 'semana') return [];
    const primeiro = inicioDaSemana(data);
    return Array.from({ length: 7 }, (_, i) => somarDias(primeiro, i)).filter(
      (dia) => eventosPorDia.has(dia) || videosPorDia.has(dia)
    );
  }, [modo, data, eventosPorDia, videosPorDia]);

  const carregando = eventos.carregando && !eventos.dados;

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Calendário</h1>

      <div role="group" aria-label="Modo de visualização" className="mt-4 grid grid-cols-2 rounded-full border border-line p-1">
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
        <GradeMensal
          data={data}
          hoje={hoje}
          selecionado={selecionado}
          eventosPorDia={eventosPorDia}
          videosPorDia={videosPorDia}
          clientes={clientes}
          aoEscolher={(dia) => {
            setSelecionado(dia);
            setData(dia);
          }}
        />
      )}

      <section className="mt-4" aria-live="polite">
        {carregando && <Esqueleto quantidade={3} />}
        {eventos.erro && <EstadoErro mensagem={eventos.erro} aoTentar={eventos.recarregar} />}

        {!carregando && !eventos.erro && modo === 'mes' && (
          <DiaDaAgenda
            dia={selecionado}
            eventos={eventosPorDia.get(selecionado) ?? []}
            videos={videosPorDia.get(selecionado) ?? []}
            clientes={clientes}
            aoMudarVideo={videos.recarregar}
          />
        )}

        {!carregando && !eventos.erro && modo === 'semana' && (
          <>
            {diasDaSemana.length === 0 && (
              <EstadoVazio icone={<CalendarX size={32} aria-hidden="true" />} titulo="Semana livre" texto="Nenhuma gravação nem prazo de edição nesta semana." />
            )}
            {diasDaSemana.map((dia) => (
              <div key={dia} className="mb-5">
                <DiaDaAgenda
                  dia={dia}
                  eventos={eventosPorDia.get(dia) ?? []}
                  videos={videosPorDia.get(dia) ?? []}
                  clientes={clientes}
                  aoMudarVideo={videos.recarregar}
                />
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}

/* ------------------------------ visão mensal ------------------------------ */

function corDoItem(clienteID: number | null, status: string, clientes: Map<number, Cliente>) {
  const cliente = clienteID ? clientes.get(clienteID) : undefined;
  return cliente ? cliente.cor : `var(--st-${status})`;
}

function GradeMensal({
  data,
  hoje,
  selecionado,
  eventosPorDia,
  videosPorDia,
  clientes,
  aoEscolher
}: {
  data: string;
  hoje: string;
  selecionado: string;
  eventosPorDia: Map<string, Evento[]>;
  videosPorDia: Map<string, ItemVideo[]>;
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
          const gravacoes = doMes ? (eventosPorDia.get(dia) ?? []) : [];
          const edicoes = doMes ? (videosPorDia.get(dia) ?? []) : [];
          const total = gravacoes.length + edicoes.length;
          const ativo = dia === selecionado;
          const descricao = [
            gravacoes.length ? `${gravacoes.length} ${gravacoes.length === 1 ? 'gravação' : 'gravações'}` : '',
            edicoes.length ? `${edicoes.length} ${edicoes.length === 1 ? 'prazo de vídeo' : 'prazos de vídeo'}` : ''
          ]
            .filter(Boolean)
            .join(' e ');

          // gravação: bolinha; prazo de vídeo: quadradinho
          const pontos = [
            ...gravacoes.map((e) => ({ chave: `g${e.id}`, cor: corDoItem(e.clienteID, e.status, clientes), quadrado: false })),
            ...edicoes.map((i) => ({ chave: `v${i.video.id}${i.papel}`, cor: corDoItem(i.video.clienteID, i.video.status, clientes), quadrado: true }))
          ].slice(0, 3);

          return (
            <button
              key={dia}
              type="button"
              aria-pressed={ativo}
              aria-label={`${formatarDiaLongo(dia)}${descricao ? `, ${descricao}` : ''}`}
              onClick={() => aoEscolher(dia)}
              className={`flex min-h-12 flex-col items-center justify-start gap-1 rounded-2xl pt-1.5 text-sm transition-colors duration-150 ${
                ativo ? 'bg-accent font-bold text-accent-ink' : doMes ? 'font-semibold' : 'text-muted opacity-50'
              } ${dia === hoje && !ativo ? 'ring-2 ring-accent-text/60' : ''}`}
            >
              <span className="tabular-nums leading-none">{numeroDoDia(dia)}</span>
              <span className="flex h-2.5 items-center gap-0.5" aria-hidden="true">
                {pontos.map((ponto) => (
                  <span
                    key={ponto.chave}
                    className={`size-2 ${ponto.quadrado ? 'rounded-[2px]' : 'rounded-full'}`}
                    style={{ background: ponto.cor, boxShadow: ativo ? '0 0 0 1px rgb(32 37 45 / 0.5)' : undefined }}
                  />
                ))}
                {total > 3 && <span className="text-[10px] leading-none">+</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="px-2 pt-2 text-xs text-muted">
        <span className="mr-1 inline-block size-2 rounded-full bg-muted align-middle" aria-hidden="true" /> gravação
        <span className="ml-3 mr-1 inline-block size-2 rounded-[2px] bg-muted align-middle" aria-hidden="true" /> prazo de vídeo
      </p>
    </div>
  );
}

function DiaDaAgenda({
  dia,
  eventos,
  videos,
  clientes,
  aoMudarVideo
}: {
  dia: string;
  eventos: Evento[];
  videos: ItemVideo[];
  clientes: Map<number, Cliente>;
  aoMudarVideo: () => void;
}) {
  const vazio = eventos.length === 0 && videos.length === 0;

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{formatarDiaCurto(dia)}</h2>
      {vazio ? (
        <EstadoVazio icone={<CalendarX size={32} aria-hidden="true" />} titulo="Dia livre" texto="Nenhuma gravação nem prazo de vídeo neste dia." />
      ) : (
        <ul className="space-y-3">
          {eventos.map((evento, i) => (
            <EventoCard key={`g${evento.id}`} evento={evento} cliente={evento.clienteID ? clientes.get(evento.clienteID) : undefined} indice={i} />
          ))}
          {videos.map(({ video, papel }, i) => (
            <VideoCard
              key={`v${video.id}${papel}`}
              video={video}
              cliente={video.clienteID ? clientes.get(video.clienteID) : undefined}
              rotuloDia={ROTULO_DO_PAPEL[papel]}
              indice={eventos.length + i}
              aoMudar={aoMudarVideo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
