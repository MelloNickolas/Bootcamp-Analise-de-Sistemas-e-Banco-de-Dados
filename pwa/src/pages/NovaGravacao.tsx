import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import { paraIsoBrasilia } from '../lib/datas';
import EventoApi from '../services/eventoApi';
import LocalApi from '../services/localApi';

export default function NovaGravacao() {
  const navegar = useNavigate();
  const locais = useCarregar(() => LocalApi.listar(), []);

  const [titulo, setTitulo] = useState('');
  const [localID, setLocalID] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!titulo.trim()) return setErro('Dê um título para a gravação.');
    if (!localID) return setErro('Escolha o local da gravação.');
    if (!inicio || !fim) return setErro('Informe o início e o fim da gravação.');
    if (fim <= inicio) return setErro('O fim precisa ser depois do início.');

    setSalvando(true);
    try {
      await EventoApi.criar({
        titulo: titulo.trim(),
        localID: Number(localID),
        inicio: paraIsoBrasilia(inicio),
        fim: paraIsoBrasilia(fim)
      });
      navegar('/calendario');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-5 pb-10">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link to="/" aria-label="Voltar" className="btn-suave !px-3">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-extrabold">Nova gravação</h1>
      </header>

      <form onSubmit={enviar} className="entra mt-4 space-y-5" noValidate>
        <div>
          <label htmlFor="titulo" className="mb-1.5 block text-sm font-semibold">
            Título
          </label>
          <input id="titulo" className="campo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Vídeo institucional" autoComplete="off" />
        </div>

        <div>
          <label htmlFor="local" className="mb-1.5 block text-sm font-semibold">
            Local
          </label>
          <select id="local" className="campo" value={localID} onChange={(e) => setLocalID(e.target.value)} disabled={locais.carregando}>
            <option value="">{locais.carregando ? 'Carregando locais...' : 'Escolha um local'}</option>
            {(locais.dados ?? []).map((local) => (
              <option key={local.id} value={local.id}>
                {local.nome}
              </option>
            ))}
          </select>
          {locais.erro && <p className="mt-1.5 text-sm text-[#c2575f]">{locais.erro}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="inicio" className="mb-1.5 block text-sm font-semibold">
              Início
            </label>
            <input id="inicio" type="datetime-local" className="campo" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fim" className="mb-1.5 block text-sm font-semibold">
              Fim
            </label>
            <input id="fim" type="datetime-local" className="campo" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>

        <p className="text-sm text-muted">Os avisos desta gravação começam 48 horas antes e repetem a cada 2 horas até você concluir.</p>

        {erro && (
          <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
            {erro}
          </p>
        )}

        <button type="submit" className="btn-ouro w-full" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar gravação'}
        </button>
      </form>
    </main>
  );
}
