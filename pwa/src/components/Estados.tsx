import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

export function Esqueleto({ quantidade = 3, altura = 92 }: { quantidade?: number; altura?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando">
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="esqueleto" style={{ height: altura }} />
      ))}
    </div>
  );
}

export function EstadoVazio({ icone, titulo, texto }: { icone: ReactNode; titulo: string; texto: string }) {
  return (
    <div className="cartao entra flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 text-accent-text">{icone}</span>
      <p className="font-display text-lg font-bold">{titulo}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{texto}</p>
    </div>
  );
}

export function EstadoErro({ mensagem, aoTentar }: { mensagem: string; aoTentar: () => void }) {
  return (
    <div role="alert" className="cartao entra flex flex-col items-center px-6 py-8 text-center">
      <p className="font-display text-lg font-bold">Não deu para carregar</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{mensagem}</p>
      <button type="button" className="btn-suave mt-4" onClick={aoTentar}>
        <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
      </button>
    </div>
  );
}
