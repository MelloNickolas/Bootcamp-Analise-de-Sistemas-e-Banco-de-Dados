import { useState } from 'react';
import { Film } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { VideoCard } from '../components/VideoCard';
import { useCarregar } from '../hooks/useCarregar';
import type { StatusVideo } from '../lib/tipos';
import VideoApi from '../services/videoApi';

const FILTROS: { valor: StatusVideo | undefined; rotulo: string }[] = [
  { valor: undefined, rotulo: 'Todos' },
  { valor: 'a_editar', rotulo: 'A editar' },
  { valor: 'em_edicao', rotulo: 'Em edição' },
  { valor: 'entregue', rotulo: 'Entregues' }
];

export default function Videos() {
  const [filtro, setFiltro] = useState<StatusVideo | undefined>(undefined);
  const videos = useCarregar(() => VideoApi.listar(filtro), [filtro]);

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Vídeos</h1>
      <p className="mt-1 text-muted">Acompanhe o que está para editar e para entregar.</p>

      <div role="group" aria-label="Filtrar por situação" className="sem-barra -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTROS.map(({ valor, rotulo }) => (
          <button
            key={rotulo}
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

      <section className="mt-4" aria-live="polite">
        {videos.carregando && <Esqueleto quantidade={3} altura={118} />}
        {videos.erro && <EstadoErro mensagem={videos.erro} aoTentar={videos.recarregar} />}
        {!videos.carregando && !videos.erro && videos.dados?.length === 0 && (
          <EstadoVazio
            icone={<Film size={32} aria-hidden="true" />}
            titulo="Nenhum vídeo aqui"
            texto="Os vídeos cadastrados com esta situação aparecem nesta lista."
          />
        )}
        <ul className="space-y-3">
          {(videos.dados ?? []).map((video, i) => (
            <VideoCard key={video.id} video={video} indice={i} aoMudar={videos.recarregar} />
          ))}
        </ul>
      </section>
    </>
  );
}
