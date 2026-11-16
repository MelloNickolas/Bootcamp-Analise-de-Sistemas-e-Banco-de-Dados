import type { CSSProperties } from 'react';
import type { StatusEvento, StatusVideo } from '../lib/tipos';

export type Status = StatusEvento | StatusVideo;

export const ROTULOS: Record<Status, string> = {
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  a_editar: 'A editar',
  em_edicao: 'Em edição',
  entregue: 'Entregue'
};

export function corDoStatus(status: Status): CSSProperties {
  return { ['--st' as string]: `var(--st-${status})` };
}

// O texto sempre acompanha a cor, para o status não depender só da cor.
export function SeloStatus({ status }: { status: Status }) {
  return (
    <span className="selo" style={corDoStatus(status)}>
      {ROTULOS[status]}
    </span>
  );
}
