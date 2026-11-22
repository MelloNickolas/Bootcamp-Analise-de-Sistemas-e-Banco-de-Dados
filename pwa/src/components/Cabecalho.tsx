import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Logo } from './Logo';

export function Cabecalho() {
  return (
    <header className="flex items-center gap-3 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
      <Logo />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="font-display text-2xl font-extrabold">Tomodachi</p>
        <p className="text-sm text-accent-text">Produção Audiovisual</p>
      </div>
      <Link to="/ajustes" aria-label="Ajustes" className="btn-suave !px-3">
        <Settings size={20} aria-hidden="true" />
      </Link>
    </header>
  );
}
