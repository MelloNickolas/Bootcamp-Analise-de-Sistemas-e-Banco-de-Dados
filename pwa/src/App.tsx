import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RotaProtegida } from './components/RotaProtegida';
import Agendar from './pages/Agendar';
import Ajustes from './pages/Ajustes';
import Cadastros from './pages/Cadastros';
import Calendario from './pages/Calendario';
import Entrar from './pages/Entrar';
import Gravacao from './pages/Gravacao';
import NovaGravacao from './pages/NovaGravacao';
import NovoVideo from './pages/NovoVideo';

export default function App() {
  return (
    <Routes>
      <Route path="entrar" element={<Entrar />} />
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Calendario />} />
          <Route path="agendar" element={<Agendar />} />
          <Route path="cadastros" element={<Cadastros />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
        <Route path="nova-gravacao" element={<NovaGravacao />} />
        <Route path="novo-video" element={<NovoVideo />} />
        <Route path="gravacao/:id" element={<Gravacao />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
