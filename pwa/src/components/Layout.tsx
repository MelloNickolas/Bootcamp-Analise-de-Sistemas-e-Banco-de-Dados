import { Outlet } from 'react-router-dom';
import { BarraInferior } from './BarraInferior';

export function Layout() {
  return (
    <>
      <main
        className="mx-auto w-full max-w-lg px-5"
        style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 6.5rem)' }}
      >
        <Outlet />
      </main>
      <BarraInferior />
    </>
  );
}
