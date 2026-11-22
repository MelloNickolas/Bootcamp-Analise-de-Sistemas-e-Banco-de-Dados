import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import { formatarDataHora, paraIsoBrasilia } from '../lib/datas';
import EventoApi from '../services/eventoApi';
import VideoApi from '../services/videoApi';

export default function NovoVideo() {
  const navegar = useNavigate();
  const gravacoes = useCarregar(() => EventoApi.listarTodos(), []);

  const [titulo, setTitulo] = useState('');
  const [eventoID, setEventoID] = useState('');
  const [prazoEdicao, setPrazoEdicao] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!titulo.trim()) return setErro('Dê um título para o vídeo.');
    if (!prazoEdicao || !prazoEntrega) return setErro('Informe o prazo de edição e o prazo de entrega.');
    if (prazoEntrega < prazoEdicao) return setErro('A entrega não pode ser antes do prazo de edição.');

    setSalvando(true);
    try {
      await VideoApi.criar({
        titulo: titulo.trim(),
        eventoID: eventoID ? Number(eventoID) : null,
        prazoEdicao: paraIsoBrasilia(prazoEdicao),
        prazoEntrega: paraIsoBrasilia(prazoEntrega)
      });
      navegar('/agendar', { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-5 pb-10">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link to="/agendar" aria-label="Voltar" className="btn-suave !px-3">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-extrabold">Agendar edição</h1>
      </header>

      <form onSubmit={enviar} className="entra mt-4 space-y-5" noValidate>
        <div>
          <label htmlFor="titulo" className="mb-1.5 block text-sm font-semibold">
            Título
          </label>
          <input id="titulo" className="campo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Vídeo institucional" autoComplete="off" />
        </div>

        <div>
          <label htmlFor="gravacao" className="mb-1.5 block text-sm font-semibold">
            Gravação de origem <span className="font-normal text-muted">(opcional)</span>
          </label>
          <select id="gravacao" className="campo" value={eventoID} onChange={(e) => setEventoID(e.target.value)} disabled={gravacoes.carregando}>
            <option value="">Nenhuma</option>
            {(gravacoes.dados ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.titulo} ({formatarDataHora(g.inicio)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edicao" className="mb-1.5 block text-sm font-semibold">
              Prazo de edição
            </label>
            <input id="edicao" type="datetime-local" className="campo" value={prazoEdicao} onChange={(e) => setPrazoEdicao(e.target.value)} />
          </div>
          <div>
            <label htmlFor="entrega" className="mb-1.5 block text-sm font-semibold">
              Prazo de entrega
            </label>
            <input id="entrega" type="datetime-local" className="campo" value={prazoEntrega} onChange={(e) => setPrazoEntrega(e.target.value)} />
          </div>
        </div>

        <p className="text-sm text-muted">Os avisos do prazo de entrega começam 48 horas antes e repetem a cada 3 horas até a entrega.</p>

        {erro && (
          <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
            {erro}
          </p>
        )}

        <button type="submit" className="btn-ouro w-full" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Agendar edição'}
        </button>
      </form>
    </main>
  );
}
