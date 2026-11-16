import { Logo } from './Logo';

export function Cabecalho() {
  return (
    <header className="flex items-center gap-3 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
      <Logo />
      <div className="leading-tight">
        <p className="font-display text-2xl font-extrabold">Tomodachi</p>
        <p className="text-sm text-accent-text">Produção Audiovisual</p>
      </div>
    </header>
  );
}
