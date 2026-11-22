import { useMemo, useState, type FormEvent } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { Confirmar } from '../components/Confirmar';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { Folha } from '../components/Folha';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import type { Equipamento } from '../lib/tipos';
import CategoriaApi from '../services/categoriaApi';
import EquipamentoApi from '../services/equipamentoApi';

const SEM_CATEGORIA = 'Sem categoria';

export function ListaEquipamentos() {
  const lista = useCarregar(() => EquipamentoApi.listar(), []);
  const [editando, setEditando] = useState<Equipamento | 'novo' | null>(null);
  const [excluindo, setExcluindo] = useState<Equipamento | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  // Agrupa por categoria, mantendo a ordem em que a API entrega
  const grupos = useMemo(() => {
    const mapa = new Map<string, Equipamento[]>();
    for (const item of lista.dados ?? []) {
      const chave = item.categoria ?? SEM_CATEGORIA;
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    }
    const nomes = [...mapa.keys()];
    nomes.sort((a, b) => (a === SEM_CATEGORIA ? 1 : b === SEM_CATEGORIA ? -1 : a.localeCompare(b, 'pt-BR')));
    return nomes.map((nome) => [nome, mapa.get(nome)!] as const);
  }, [lista.dados]);

  async function excluir() {
    if (!excluindo) return;
    setProcessando(true);
    setErroExcluir(null);
    try {
      await EquipamentoApi.excluir(excluindo.id);
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
        <Plus size={20} aria-hidden="true" /> Novo equipamento
      </button>

      <section className="mt-4" aria-live="polite">
        {lista.carregando && <Esqueleto quantidade={3} altura={76} />}
        {lista.erro && <EstadoErro mensagem={lista.erro} aoTentar={lista.recarregar} />}
        {!lista.carregando && !lista.erro && lista.dados?.length === 0 && (
          <EstadoVazio icone={<Package size={32} aria-hidden="true" />} titulo="Nenhum equipamento" texto="Cadastre câmeras, luzes, microfones e o que mais for reservado nas gravações." />
        )}

        {grupos.map(([categoria, itens]) => (
          <div key={categoria} className="mb-5">
            <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {categoria}
              <span className="font-normal normal-case">({itens.length})</span>
            </h2>
            <ul className="space-y-3">
              {itens.map((item, i) => (
                <li key={item.id} className="cartao entra flex items-center gap-3 p-4" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-bold">
                      {item.nome}
                      {!item.ativo && <span className="selo">Inativo</span>}
                    </p>
                    {item.descricao && <p className="text-sm text-muted">{item.descricao}</p>}
                  </div>
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
          </div>
        ))}
      </section>

      {editando && (
        <FormularioEquipamento
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
          titulo="Excluir equipamento?"
          texto={`"${excluindo.nome}" será removido da lista. Se ele já foi reservado em alguma gravação, desative em vez de excluir.`}
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

function FormularioEquipamento({ item, aoFechar, aoSalvar }: { item: Equipamento | null; aoFechar: () => void; aoSalvar: () => void }) {
  const categorias = useCarregar(() => CategoriaApi.listar(), []);
  const [nome, setNome] = useState(item?.nome ?? '');
  const [descricao, setDescricao] = useState(item?.descricao ?? '');
  const [categoriaID, setCategoriaID] = useState(item?.categoriaID ? String(item.categoriaID) : '');
  const [ativo, setAtivo] = useState(item?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Dê um nome para o equipamento.');
    setSalvando(true);
    setErro(null);
    const dados = { nome: nome.trim(), descricao: descricao.trim() || null, ativo, categoriaID: categoriaID ? Number(categoriaID) : null };
    try {
      if (item) await EquipamentoApi.atualizar(item.id, dados);
      else await EquipamentoApi.criar(dados);
      aoSalvar();
    } catch (ex) {
      setErro(mensagemDeErro(ex));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Folha titulo={item ? 'Editar equipamento' : 'Novo equipamento'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <div>
          <label htmlFor="eq-nome" className="mb-1.5 block text-sm font-semibold">
            Nome
          </label>
          <input id="eq-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Sony A6300" autoComplete="off" autoFocus />
        </div>
        <div>
          <label htmlFor="eq-cat" className="mb-1.5 block text-sm font-semibold">
            Categoria
          </label>
          <select id="eq-cat" className="campo" value={categoriaID} onChange={(e) => setCategoriaID(e.target.value)} disabled={categorias.carregando}>
            <option value="">Sem categoria</option>
            {(categorias.dados ?? []).map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eq-desc" className="mb-1.5 block text-sm font-semibold">
            Descrição <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input id="eq-desc" className="campo" value={descricao} onChange={(e) => setDescricao(e.target.value)} autoComplete="off" />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" className="size-5 accent-[#d6bd87]" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          <span>
            <span className="block font-semibold">Disponível para reserva</span>
            <span className="block text-sm text-muted">Desmarque para guardar o equipamento sem poder reservá-lo.</span>
          </span>
        </label>
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
