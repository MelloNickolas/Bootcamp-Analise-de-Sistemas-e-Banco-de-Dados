import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCarregar } from '../hooks/useCarregar';
import { useClientes } from '../hooks/useClientes';
import { mensagemDeErro } from '../lib/api';
import { hojeIso, paraIsoBrasilia, somarDias } from '../lib/datas';
import EventoApi from '../services/eventoApi';
import LocalApi from '../services/localApi';

export default function NovaGravacao() {
  const navegar = useNavigate();
  const locais = useCarregar(() => LocalApi.listar(), []);
  const { lista: clientes, carregando: carregandoClientes } = useClientes();

  const [titulo, setTitulo] = useState('');
  const [localID, setLocalID] = useState('');
  const [clienteID, setClienteID] = useState('');
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [dia, setDia] = useState(hojeIso());
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!titulo.trim()) return setErro('Dê um título para a gravação.');
    if (!localID) return setErro('Escolha o local da gravação.');

    let inicioIso: string;
    let fimIso: string;
    if (diaInteiro) {
      if (!dia) return setErro('Escolha o dia da gravação.');
      // Dia inteiro: da meia-noite até a meia-noite seguinte
      inicioIso = paraIsoBrasilia(`${dia}T00:00`);
      fimIso = paraIsoBrasilia(`${somarDias(dia, 1)}T00:00`);
    } else {
      if (!inicio || !fim) return setErro('Informe o início e o fim da gravação.');
      if (fim <= inicio) return setErro('O fim precisa ser depois do início.');
      inicioIso = paraIsoBrasilia(inicio);
      fimIso = paraIsoBrasilia(fim);
    }

    setSalvando(true);
    try {
      const novoID = await EventoApi.criar({
        titulo: titulo.trim(),
        localID: Number(localID),
        clienteID: clienteID ? Number(clienteID) : null,
        inicio: inicioIso,
        fim: fimIso
      });
      // Segue direto para a gravação, onde dá para reservar os equipamentos
      navegar(`/gravacao/${novoID}`, { replace: true });
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
          <label htmlFor="cliente" className="mb-1.5 block text-sm font-semibold">
            Cliente <span className="font-normal text-muted">(opcional)</span>
          </label>
          <select id="cliente" className="campo" value={clienteID} onChange={(e) => setClienteID(e.target.value)} disabled={carregandoClientes}>
            <option value="">Sem cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
          {!carregandoClientes && clientes.length === 0 && (
            <p className="mt-1.5 text-sm text-muted">
              Cadastre as empresas em <Link to="/cadastros" className="font-semibold text-accent-text">Cadastros</Link> para colorir o calendário.
            </p>
          )}
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
          {!locais.carregando && !locais.erro && locais.dados?.length === 0 && (
            <p className="mt-1.5 text-sm text-muted">
              Nenhum local cadastrado. Cadastre em <Link to="/cadastros" className="font-semibold text-accent-text">Cadastros</Link>.
            </p>
          )}
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" className="size-5 accent-[#d6bd87]" checked={diaInteiro} onChange={(e) => setDiaInteiro(e.target.checked)} />
          <span>
            <span className="block font-semibold">Dia inteiro</span>
            <span className="block text-sm text-muted">A gravação ocupa o dia todo, da meia-noite à meia-noite.</span>
          </span>
        </label>

        {diaInteiro ? (
          <div>
            <label htmlFor="dia" className="mb-1.5 block text-sm font-semibold">
              Dia
            </label>
            <input id="dia" type="date" className="campo" value={dia} onChange={(e) => setDia(e.target.value)} />
          </div>
        ) : (
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
        )}

        <p className="text-sm text-muted">Os avisos desta gravação começam 48 horas antes e repetem a cada 3 horas até você concluir.</p>

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
