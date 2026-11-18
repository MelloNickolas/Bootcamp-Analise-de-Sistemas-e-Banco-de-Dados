import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { mensagemDeErro } from '../lib/api';
import { estaAutenticado, guardarSessao } from '../lib/auth';
import AuthApi from '../services/authApi';

export default function Entrar() {
  const navegar = useNavigate();
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (estaAutenticado()) return <Navigate to="/" replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!senha) return setErro('Digite a senha da equipe.');

    setEntrando(true);
    setErro(null);
    try {
      guardarSessao(await AuthApi.entrar(senha));
      navegar('/', { replace: true });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        setErro('Muitas tentativas seguidas. Espere um minuto e tente de novo.');
      } else {
        setErro(mensagemDeErro(e));
      }
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="entra flex flex-col items-center text-center">
        <Logo tamanho={72} />
        <h1 className="mt-4 text-3xl font-extrabold">Tomodachi</h1>
        <p className="text-sm text-accent-text">Produção Audiovisual</p>
      </div>

      <form onSubmit={enviar} className="cartao entra mt-8 space-y-4 p-5" style={{ animationDelay: '80ms' }} noValidate>
        <div>
          <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold">
            Senha da equipe
          </label>
          <div className="relative">
            <input
              id="senha"
              type={mostrar ? 'text' : 'password'}
              className="campo pr-12"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-muted"
              onClick={() => setMostrar(!mostrar)}
              aria-label={mostrar ? 'Esconder a senha' : 'Mostrar a senha'}
            >
              {mostrar ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {erro && (
          <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
            {erro}
          </p>
        )}

        <button type="submit" className="btn-ouro w-full" disabled={entrando}>
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
