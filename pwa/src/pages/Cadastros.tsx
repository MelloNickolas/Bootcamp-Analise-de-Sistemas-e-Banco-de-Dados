import { useState, type FormEvent } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { Confirmar } from '../components/Confirmar';
import { EstadoErro, EstadoVazio, Esqueleto } from '../components/Estados';
import { Folha } from '../components/Folha';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import type { Local } from '../lib/tipos';
import LocalApi from '../services/localApi';
import { ListaCategorias } from './CadastroCategorias';
import { ListaClientes } from './CadastroClientes';
import { ListaEquipamentos } from './CadastroEquipamentos';

type Aba = 'clientes' | 'locais' | 'equipamentos' | 'categorias';

const ABAS: [Aba, string][] = [
  ['clientes', 'Clientes'],
  ['locais', 'Locais'],
  ['equipamentos', 'Equipamentos'],
  ['categorias', 'Categorias']
];

export default function Cadastros() {
  const [aba, setAba] = useState<Aba>('clientes');

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Cadastros</h1>
      <p className="mt-1 text-muted">Clientes, locais, equipamentos e categorias usados nas gravações.</p>

      <div role="group" aria-label="O que cadastrar" className="sem-barra -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {ABAS.map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={aba === valor}
            onClick={() => setAba(valor)}
            className={`min-h-11 flex-none rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
              aba === valor ? 'border-transparent bg-accent text-accent-ink' : 'border-line text-muted'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {aba === 'clientes' && <ListaClientes />}
        {aba === 'locais' && <ListaLocais />}
        {aba === 'equipamentos' && <ListaEquipamentos />}
        {aba === 'categorias' && <ListaCategorias />}
      </div>
    </>
  );
}

/* ------------------------------------- Locais ------------------------------------- */

function ListaLocais() {
  const lista = useCarregar(() => LocalApi.listar(), []);
  const [editando, setEditando] = useState<Local | 'novo' | null>(null);
  const [excluindo, setExcluindo] = useState<Local | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  async function excluir() {
    if (!excluindo) return;
    setProcessando(true);
    setErroExcluir(null);
    try {
      await LocalApi.excluir(excluindo.id);
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
        <Plus size={20} aria-hidden="true" /> Novo local
      </button>

      <section className="mt-4" aria-live="polite">
        {lista.carregando && <Esqueleto quantidade={3} altura={76} />}
        {lista.erro && <EstadoErro mensagem={lista.erro} aoTentar={lista.recarregar} />}
        {!lista.carregando && !lista.erro && lista.dados?.length === 0 && (
          <EstadoVazio icone={<MapPin size={32} aria-hidden="true" />} titulo="Nenhum local" texto="Cadastre o estúdio e os lugares onde a equipe costuma gravar." />
        )}
        <ul className="space-y-3">
          {(lista.dados ?? []).map((item, i) => (
            <li key={item.id} className="cartao entra flex items-center gap-3 p-4" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.nome}</p>
                {item.endereco && <p className="text-sm text-muted">{item.endereco}</p>}
              </div>
              <button type="button" className="btn-suave !px-3" aria-label={`Editar ${item.nome}`} onClick={() => setEditando(item)}>
                <Pencil size={18} aria-hidden="true" />
              </button>
              <button type="button" className="btn-suave !px-3" aria-label={`Excluir ${item.nome}`} onClick={() => { setErroExcluir(null); setExcluindo(item); }}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {editando && (
        <FormularioLocal
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
          titulo="Excluir local?"
          texto={`"${excluindo.nome}" será removido da lista. Locais já usados em gravações não podem ser excluídos.`}
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

function FormularioLocal({ item, aoFechar, aoSalvar }: { item: Local | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState(item?.nome ?? '');
  const [endereco, setEndereco] = useState(item?.endereco ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Dê um nome para o local.');
    setSalvando(true);
    setErro(null);
    const dados = { nome: nome.trim(), endereco: endereco.trim() || null };
    try {
      if (item) await LocalApi.atualizar(item.id, dados);
      else await LocalApi.criar(dados);
      aoSalvar();
    } catch (ex) {
      setErro(mensagemDeErro(ex));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Folha titulo={item ? 'Editar local' : 'Novo local'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <div>
          <label htmlFor="lo-nome" className="mb-1.5 block text-sm font-semibold">
            Nome
          </label>
          <input id="lo-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Estúdio Tomodachi" autoComplete="off" autoFocus />
        </div>
        <div>
          <label htmlFor="lo-end" className="mb-1.5 block text-sm font-semibold">
            Endereço <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input id="lo-end" className="campo" value={endereco} onChange={(e) => setEndereco(e.target.value)} autoComplete="off" />
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
