import { useState } from 'react';
import { CalendarClock, Check, Scissors } from 'lucide-react';
import type { StatusVideo, Video } from '../lib/tipos';
import { formatarDataHora, prazoRelativo } from '../lib/datas';
import { mensagemDeErro } from '../lib/api';
import VideoApi from '../services/videoApi';
import { SeloStatus, corDoStatus } from './SeloStatus';

const PROXIMO: Partial<Record<StatusVideo, { status: StatusVideo; rotulo: string }>> = {
  a_editar: { status: 'em_edicao', rotulo: 'Iniciar edição' },
  em_edicao: { status: 'entregue', rotulo: 'Marcar como entregue' }
};

export function VideoCard({ video, indice = 0, aoMudar }: { video: Video; indice?: number; aoMudar: () => void }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const proximo = PROXIMO[video.status];
  const prazo = prazoRelativo(video.prazoEntrega);

  async function avancar() {
    if (!proximo) return;
    setSalvando(true);
    setErro(null);
    try {
      await VideoApi.alterarStatus(video.id, proximo.status);
      aoMudar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <li className="cartao entra p-4" style={{ animationDelay: `${indice * 40}ms` }}>
      <div className="flex items-start gap-3">
        <span className="ponto mt-2" style={corDoStatus(video.status)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-snug">{video.titulo}</h3>
            <SeloStatus status={video.status} />
          </div>
          {video.evento && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Scissors size={14} aria-hidden="true" /> Gravação: {video.evento}
            </p>
          )}
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
            <CalendarClock size={14} className="mt-1 flex-none" aria-hidden="true" />
            <span>
              Entrega {formatarDataHora(video.prazoEntrega)}
              {video.status !== 'entregue' && (
                <span className={prazo.atrasado ? 'font-semibold text-[#c2575f]' : 'font-medium text-accent-text'}> · {prazo.texto}</span>
              )}
            </span>
          </p>
        </div>
      </div>

      {proximo && (
        <button type="button" className="btn-suave mt-3 w-full" onClick={avancar} disabled={salvando}>
          <Check size={18} aria-hidden="true" />
          {salvando ? 'Salvando...' : proximo.rotulo}
        </button>
      )}
      {erro && (
        <p role="alert" className="mt-2 text-sm text-[#c2575f]">
          {erro}
        </p>
      )}
    </li>
  );
}
