import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

// Janela que sobe de baixo (formulários e confirmações). Fecha com Esc, tocando fora ou no X.
export function Folha({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  useEffect(() => {
    const aoApertar = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', aoApertar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoApertar);
      document.body.style.overflow = anterior;
    };
  }, [aoFechar]);

  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Fechar" tabIndex={-1} className="absolute inset-0 cursor-default bg-black/55" onClick={aoFechar} />
      <div
        className="cartao entra relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-b-none p-5"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button type="button" className="btn-suave !px-3" onClick={aoFechar} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
