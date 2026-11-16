import { Clapperboard, MapPin } from 'lucide-react';
import type { Evento } from '../lib/tipos';
import { formatarHora } from '../lib/datas';
import { SeloStatus, corDoStatus } from './SeloStatus';

export function EventoCard({ evento, indice = 0 }: { evento: Evento; indice?: number }) {
  return (
    <li className="cartao entra flex gap-3 p-4" style={{ animationDelay: `${indice * 40}ms` }}>
      <span className="ponto mt-2" style={corDoStatus(evento.status)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug">{evento.titulo}</h3>
          <SeloStatus status={evento.status} />
        </div>
        <p className="mt-1 text-sm text-muted tabular-nums">
          {formatarHora(evento.inicio)} às {formatarHora(evento.fim)}
          {evento.local && (
            <>
              <span aria-hidden="true"> · </span>
              <MapPin size={14} className="mb-0.5 inline" aria-hidden="true" /> {evento.local}
            </>
          )}
        </p>
        {evento.equipamentos.length > 0 && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
            <Clapperboard size={15} className="mt-0.5 flex-none" aria-hidden="true" />
            <span>{evento.equipamentos.join(', ')}</span>
          </p>
        )}
      </div>
    </li>
  );
}
