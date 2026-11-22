import { useState, type FormEvent } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { AvatarCliente } from '../components/AvatarCliente';
import { Confirmar } from '../components/Confirmar';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { Folha } from '../components/Folha';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import { CORES_SUGERIDAS } from '../lib/cores';
import { reduzirImagem } from '../lib/imagem';
import type { Cliente } from '../lib/tipos';
import ClienteApi from '../services/clienteApi';

export function ListaClientes() {
  const lista = useCarregar(() => ClienteApi.listar(), []);
  const [editando, setEditando] = useState<Cliente | 'novo' | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  async function excluir() {
    if (!excluindo) return;
    setProcessando(true);
    setErroExcluir(null);
    try {
      await ClienteApi.excluir(excluindo.id);
      setExcluindo(null);
      lista.recarregar();
    } catch (e) {
      setErroExcluir(mensagemDeErro(e));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <button type="button" className="btn-ouro w-full" onClick={() => setEditando('novo')}>
        <Plus size={20} aria-hidden="true" /> Novo cliente
      </button>

      <section className="mt-4" aria-live="polite">
        {lista.carregando && <Esqueleto quantidade={3} altura={76} />}
        {lista.erro && <EstadoErro mensagem={lista.erro} aoTentar={lista.recarregar} />}
        {!lista.carregando && !lista.erro && lista.dados?.length === 0 && (
          <EstadoVazio
            icone={<Users size={32} aria-hidden="true" />}
            titulo="Nenhum cliente"
            texto="Cadastre as empresas para as quais a Tomodachi grava. Cada uma ganha uma cor e uma logo no calendário."
          />
        )}
        <ul className="space-y-3">
          {(lista.dados ?? []).map((item, i) => (
            <li
              key={item.id}
              className="cartao entra flex items-center gap-3 p-4"
              style={{ animationDelay: `${i * 40}ms`, borderLeft: `5px solid ${item.cor}` }}
            >
              <AvatarCliente cliente={item} />
              <p className="min-w-0 flex-1 truncate font-bold">{item.nome}</p>
              <button type="button" className="btn-suave !px-3" aria-label={`Editar ${item.nome}`} onClick={() => setEditando(item)}>
                <Pencil size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-suave !px-3"
                aria-label={`Excluir ${item.nome}`}
                onClick={() => {
                  setErroExcluir(null);
                  setExcluindo(item);
                }}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {editando && (
        <FormularioCliente
          item={editando === 'novo' ? null : editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            lista.recarregar();
          }}
        />
      )}
      {excluindo && (
        <Confirmar
          titulo="Excluir cliente?"
          texto={`"${excluindo.nome}" será removido. As gravações dele continuam no calendário, só perdem a cor e a logo.`}
          rotulo="Excluir"
          carregando={processando}
          erro={erroExcluir}
          aoConfirmar={excluir}
          aoCancelar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}

function FormularioCliente({ item, aoFechar, aoSalvar }: { item: Cliente | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState(item?.nome ?? '');
  const [cor, setCor] = useState(item?.cor ?? CORES_SUGERIDAS[0]);
  const [logo, setLogo] = useState<string | null>(item?.logo ?? null);
  const [lendo, setLendo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function escolherLogo(arquivo: File | undefined) {
    if (!arquivo) return;
    setLendo(true);
    setErro(null);
    try {
      setLogo(await reduzirImagem(arquivo));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui usar essa imagem.');
    } finally {
      setLendo(false);
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Dê um nome para o cliente.');
    setSalvando(true);
    setErro(null);
    const dados = { nome: nome.trim(), cor, logo };
    try {
      if (item) await ClienteApi.atualizar(item.id, dados);
      else await ClienteApi.criar(dados);
      aoSalvar();
    } catch (ex) {
      setErro(mensagemDeErro(ex));
    } finally {
      setSalvando(false);
    }
  }

  const previa = { nome: nome.trim() || 'Cliente', cor, logo };

  return (
    <Folha titulo={item ? 'Editar cliente' : 'Novo cliente'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-5" noValidate>
        <div className="flex items-center gap-3 rounded-2xl border border-line p-3" style={{ borderLeft: `5px solid ${cor}` }} aria-label="Prévia no calendário">
          <AvatarCliente cliente={previa} tamanho={48} />
          <div className="min-w-0">
            <p className="truncate font-bold">{previa.nome}</p>
            <p className="text-sm text-muted">Assim aparece no calendário</p>
          </div>
        </div>

        <div>
          <label htmlFor="cl-nome" className="mb-1.5 block text-sm font-semibold">
            Nome da empresa
          </label>
          <input id="cl-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Padaria Estrela" autoComplete="off" autoFocus />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Cor</legend>
          <div className="flex flex-wrap items-center gap-2">
            {CORES_SUGERIDAS.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                aria-label={`Usar a cor ${sugestao}`}
                aria-pressed={cor.toLowerCase() === sugestao.toLowerCase()}
                onClick={() => setCor(sugestao)}
                className="size-11 rounded-full border-2 border-transparent transition-transform duration-150 active:scale-95 aria-pressed:border-[var(--ink)]"
                style={{ background: sugestao }}
              />
            ))}
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value.toUpperCase())}
                className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Escolher outra cor"
              />
              Outra
            </label>
          </div>
        </fieldset>

        <div>
          <p className="mb-1.5 text-sm font-semibold">
            Logo <span className="font-normal text-muted">(opcional)</span>
          </p>
          <div className="flex items-center gap-3">
            <label className="btn-suave cursor-pointer">
              <ImagePlus size={18} aria-hidden="true" />
              {lendo ? 'Lendo...' : logo ? 'Trocar imagem' : 'Escolher imagem'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => escolherLogo(e.target.files?.[0])} />
            </label>
            {logo && (
              <button type="button" className="btn-suave" onClick={() => setLogo(null)}>
                Remover
              </button>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted">A imagem é reduzida sozinha para ficar leve.</p>
        </div>

        {erro && (
          <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
            {erro}
          </p>
        )}
        <button type="submit" className="btn-ouro w-full" disabled={salvando || lendo}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Folha>
  );
}
