import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Ajustes from './pages/Ajustes';
import Calendario from './pages/Calendario';
import Inicio from './pages/Inicio';
import NovaGravacao from './pages/NovaGravacao';
import Videos from './pages/Videos';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="videos" element={<Videos />} />
        <Route path="ajustes" element={<Ajustes />} />
      </Route>
      <Route path="nova-gravacao" element={<NovaGravacao />} />
      <Route path="*" element={<Layout />}>
        <Route path="*" element={<Inicio />} />
      </Route>
    </Routes>
  );
}
