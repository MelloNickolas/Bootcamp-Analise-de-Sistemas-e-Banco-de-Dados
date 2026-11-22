import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { Confirmar } from '../components/Confirmar';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { Folha } from '../components/Folha';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import type { Categoria } from '../lib/tipos';
import CategoriaApi from '../services/categoriaApi';

export function ListaCategorias() {
  const lista = useCarregar(() => CategoriaApi.listar(), []);
  const [editando, setEditando] = useState<Categoria | 'nova' | null>(null);
  const [excluindo, setExcluindo] = useState<Categoria | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  async function excluir() {
    if (!excluindo) return;
    setProcessando(true);
    setErroExcluir(null);
    try {
      await CategoriaApi.excluir(excluindo.id);
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
      <button type="button" className="btn-ouro w-full" onClick={() => setEditando('nova')}>
        <Plus size={20} aria-hidden="true" /> Nova categoria
      </button>

      <section className="mt-4" aria-live="polite">
        {lista.carregando && <Esqueleto quantidade={3} altura={64} />}
        {lista.erro && <EstadoErro mensagem={lista.erro} aoTentar={lista.recarregar} />}
        {!lista.carregando && !lista.erro && lista.dados?.length === 0 && (
          <EstadoVazio icone={<Tags size={32} aria-hidden="true" />} titulo="Nenhuma categoria" texto="Crie categorias como câmeras, lentes, áudio e iluminação para organizar os equipamentos." />
        )}
        <ul className="space-y-3">
          {(lista.dados ?? []).map((item, i) => (
            <li key={item.id} className="cartao entra flex items-center gap-3 p-4" style={{ animationDelay: `${i * 30}ms` }}>
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
        <FormularioCategoria
          item={editando === 'nova' ? null : editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            lista.recarregar();
          }}
        />
      )}
      {excluindo && (
        <Confirmar
          titulo="Excluir categoria?"
          texto={`"${excluindo.nome}" será removida. Os equipamentos dela continuam cadastrados, só ficam sem categoria.`}
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

function FormularioCategoria({ item, aoFechar, aoSalvar }: { item: Categoria | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState(item?.nome ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Dê um nome para a categoria.');
    setSalvando(true);
    setErro(null);
    try {
      if (item) await CategoriaApi.atualizar(item.id, nome.trim());
      else await CategoriaApi.criar(nome.trim());
      aoSalvar();
    } catch (ex) {
      setErro(mensagemDeErro(ex));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Folha titulo={item ? 'Editar categoria' : 'Nova categoria'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <div>
          <label htmlFor="cat-nome" className="mb-1.5 block text-sm font-semibold">
            Nome
          </label>
          <input id="cat-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Iluminação" autoComplete="off" autoFocus />
        </div>
        {erro && (
          <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
            {erro}
          </p>
        )}
        <button type="submit" className="btn-ouro w-full" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Folha>
  );
}
