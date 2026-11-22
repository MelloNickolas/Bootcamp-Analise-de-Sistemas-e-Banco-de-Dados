import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Video as VideoIcon } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EventoCard } from '../components/EventoCard';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { useCarregar } from '../hooks/useCarregar';
import { useClientes } from '../hooks/useClientes';
import { hojeIso } from '../lib/datas';
import EventoApi from '../services/eventoApi';
import VideoApi from '../services/videoApi';

export default function Inicio() {
  const semana = useCarregar(() => EventoApi.listarSemana(hojeIso()), []);
  const videos = useCarregar(() => VideoApi.listar(), []);
  const { mapa: clientes } = useClientes();

  const agora = Date.now();
  const proximas = (semana.dados ?? []).filter((evento) => new Date(evento.fim).getTime() >= agora).slice(0, 4);
  const emAndamento = (videos.dados ?? []).filter((video) => video.status !== 'entregue').length;

  return (
    <>
      <Cabecalho />

      <section className="entra mt-4" aria-labelledby="ola">
        <h1 id="ola" className="text-[2rem] font-extrabold leading-tight">
          Olá! Bom trabalho.
        </h1>
        <p className="mt-1 text-muted">Aqui está um resumo das suas atividades.</p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3" aria-label="Resumo">
        <div className="cartao entra p-4" style={{ animationDelay: '60ms' }}>
          <CalendarDays size={22} className="text-accent-text" aria-hidden="true" />
          <p className="mt-3 font-display text-4xl font-extrabold tabular-nums">{semana.carregando ? '–' : (semana.dados?.length ?? 0)}</p>
          <p className="text-sm text-muted">Gravações na semana</p>
        </div>
        <div className="cartao entra p-4" style={{ animationDelay: '100ms' }}>
          <VideoIcon size={22} className="text-accent-text" aria-hidden="true" />
          <p className="mt-3 font-display text-4xl font-extrabold tabular-nums">{videos.carregando ? '–' : emAndamento}</p>
          <p className="text-sm text-muted">Vídeos em andamento</p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="proximas">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="proximas" className="text-xl font-bold">
            Próximas gravações
          </h2>
          <Link to="/calendario" className="flex min-h-11 items-center text-sm font-semibold text-accent-text">
            Ver todas
          </Link>
        </div>

        {semana.carregando && <Esqueleto quantidade={3} />}
        {semana.erro && <EstadoErro mensagem={semana.erro} aoTentar={semana.recarregar} />}
        {!semana.carregando && !semana.erro && proximas.length === 0 && (
          <EstadoVazio
            icone={<CalendarDays size={32} aria-hidden="true" />}
            titulo="Nenhuma gravação por aqui"
            texto="Quando você agendar uma gravação nesta semana, ela aparece nesta lista."
          />
        )}
        <ul className="space-y-3">
          {proximas.map((evento, i) => (
            <EventoCard key={evento.id} evento={evento} cliente={evento.clienteID ? clientes.get(evento.clienteID) : undefined} indice={i} />
          ))}
        </ul>
      </section>

      <div
        className="pointer-events-none fixed inset-x-0 z-30 px-5"
        style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div className="mx-auto max-w-lg">
          <Link to="/nova-gravacao" className="btn-ouro pointer-events-auto w-full">
            <Plus size={22} aria-hidden="true" /> Nova gravação
          </Link>
        </div>
      </div>
    </>
  );
}
