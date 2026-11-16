import { NavLink } from 'react-router-dom';
import { CalendarDays, Clapperboard, Home, Settings } from 'lucide-react';

const ITENS = [
  { para: '/', rotulo: 'Início', Icone: Home },
  { para: '/calendario', rotulo: 'Calendário', Icone: CalendarDays },
  { para: '/videos', rotulo: 'Vídeos', Icone: Clapperboard },
  { para: '/ajustes', rotulo: 'Ajustes', Icone: Settings }
];

export function BarraInferior() {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/85 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg" style={{ height: 'var(--nav-h)' }}>
        {ITENS.map(({ para, rotulo, Icone }) => (
          <li key={para} className="flex-1">
            <NavLink
              to={para}
              end={para === '/'}
              className={({ isActive }) =>
                `relative flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-200 ${
                  isActive ? 'text-accent-text' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />}
                  <Icone size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                  {rotulo}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
