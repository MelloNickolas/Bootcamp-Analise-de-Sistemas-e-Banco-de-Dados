import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clapperboard, Film, Scissors } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { VideoCard } from '../components/VideoCard';
import { useCarregar } from '../hooks/useCarregar';
import { useClientes } from '../hooks/useClientes';
import type { Video } from '../lib/tipos';
import VideoApi from '../services/videoApi';

type Filtro = 'andamento' | 'a_editar' | 'em_edicao' | 'entregue' | 'todos';

const FILTROS: [Filtro, string][] = [
  ['andamento', 'Em andamento'],
  ['a_editar', 'A editar'],
  ['em_edicao', 'Em edição'],
  ['entregue', 'Entregues'],
  ['todos', 'Todos']
];

const OPCOES = [
  {
    para: '/nova-gravacao',
    titulo: 'Gravação',
    texto: 'Dia e horário (ou dia inteiro), cliente, local e equipamentos.',
    Icone: Clapperboard
  },
  {
    para: '/novo-video',
    titulo: 'Edição de vídeo',
    texto: 'Prazo de edição e de entrega, com aviso 48 horas antes.',
    Icone: Scissors
  }
];

function passa(video: Video, filtro: Filtro) {
  if (filtro === 'todos') return true;
  if (filtro === 'andamento') return video.status !== 'entregue';
  return video.status === filtro;
}

export default function Agendar() {
  const [filtro, setFiltro] = useState<Filtro>('andamento');
  const videos = useCarregar(() => VideoApi.listar(), []);
  const { mapa: clientes } = useClientes();
  const lista = (videos.dados ?? []).filter((video) => passa(video, filtro));

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Agendar</h1>
      <p className="mt-1 text-muted">O que você quer colocar no calendário?</p>

      <ul className="mt-4 space-y-3">
        {OPCOES.map(({ para, titulo, texto, Icone }, i) => (
          <li key={para} className="cartao entra" style={{ animationDelay: `${i * 50}ms` }}>
            <Link to={para} className="flex items-center gap-4 p-4" aria-label={`Agendar ${titulo}`}>
              <span className="flex size-12 flex-none items-center justify-center rounded-2xl bg-accent text-accent-ink">
                <Icone size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">{titulo}</span>
                <span className="block text-sm text-muted">{texto}</span>
              </span>
              <ChevronRight size={20} className="flex-none text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8" aria-labelledby="edicoes">
        <h2 id="edicoes" className="text-xl font-bold">
          Edições de vídeo
        </h2>
        <p className="text-sm text-muted">Avance cada vídeo. Se uma entrega precisar de correção, reabra a edição.</p>

        <div role="group" aria-label="Filtrar por situação" className="sem-barra -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          {FILTROS.map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
              className={`min-h-11 flex-none rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                filtro === valor ? 'border-transparent bg-accent text-accent-ink' : 'border-line text-muted'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className="mt-4" aria-live="polite">
          {videos.carregando && <Esqueleto quantidade={2} altura={130} />}
          {videos.erro && <EstadoErro mensagem={videos.erro} aoTentar={videos.recarregar} />}
          {!videos.carregando && !videos.erro && lista.length === 0 && (
            <EstadoVazio icone={<Film size={32} aria-hidden="true" />} titulo="Nenhuma edição aqui" texto="Os vídeos com esta situação aparecem nesta lista." />
          )}
          <ul className="space-y-3">
            {lista.map((video, i) => (
              <VideoCard key={video.id} video={video} cliente={video.clienteID ? clientes.get(video.clienteID) : undefined} indice={i} aoMudar={videos.recarregar} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
