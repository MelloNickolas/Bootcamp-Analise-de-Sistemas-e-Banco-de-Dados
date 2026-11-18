import { Navigate, Outlet } from 'react-router-dom';
import { estaAutenticado } from '../lib/auth';

// Só deixa passar quem já entrou com a senha da equipe
export function RotaProtegida() {
  return estaAutenticado() ? <Outlet /> : <Navigate to="/entrar" replace />;
}
