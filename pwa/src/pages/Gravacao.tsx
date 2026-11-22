import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Plus, X } from 'lucide-react';
import { Confirmar } from '../components/Confirmar';
import { EstadoErro, Esqueleto } from '../components/Estados';
import { AvatarCliente } from '../components/AvatarCliente';
import { SeloStatus } from '../components/SeloStatus';
import { useCarregar } from '../hooks/useCarregar';
import { useClientes } from '../hooks/useClientes';
import { mensagemDeErro } from '../lib/api';
import { formatarDiaLongo, chaveDia, formatarHorario } from '../lib/datas';
import EquipamentoApi from '../services/equipamentoApi';
import EventoApi from '../services/eventoApi';

type Acao = 'concluir' | 'cancelar';

export default function Gravacao() {
  const { id } = useParams();
  const navegar = useNavigate();
  const codigo = Number(id);

  const evento = useCarregar(() => EventoApi.obter(codigo), [codigo]);
  const equipamentos = useCarregar(() => EquipamentoApi.listar(), []);
  const { mapa: clientes } = useClientes();

  const [escolhido, setEscolhido] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [acao, setAcao] = useState<Acao | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const dados = evento.dados;
  const cliente = dados?.clienteID ? clientes.get(dados.clienteID) : undefined;
  const editavel = dados?.status === 'agendado';
  const jaReservados = new Set((dados?.reservas ?? []).map((r) => r.equipamentoID));
  const disponiveis = (equipamentos.dados ?? []).filter((e) => e.ativo && !jaReservados.has(e.id));
  // Agrupa por categoria para a lista ficar fácil de percorrer
  const gruposDisponiveis = Object.entries(
    disponiveis.reduce<Record<string, typeof disponiveis>>((grupos, e) => {
      const chave = e.categoria ?? 'Sem categoria';
      (grupos[chave] ??= []).push(e);
      return grupos;
    }, {})
  );

  async function reservar() {
    if (!escolhido) return;
    setOcupado(true);
    setErro(null);
    try {
      await EventoApi.reservarEquipamento(codigo, Number(escolhido));
      setEscolhido('');
      evento.recarregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  async function liberar(equipamentoID: number) {
    setOcupado(true);
    setErro(null);
    try {
      await EventoApi.liberarEquipamento(codigo, equipamentoID);
      evento.recarregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  async function confirmarAcao() {
    if (!acao) return;
    setOcupado(true);
    setErroAcao(null);
    try {
      if (acao === 'concluir') await EventoApi.concluir(codigo);
      else await EventoApi.cancelar(codigo);
      setAcao(null);
      evento.recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-5 pb-10">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <button type="button" aria-label="Voltar" className="btn-suave !px-3" onClick={() => navegar(-1)}>
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-extrabold">{dados?.titulo ?? 'Gravação'}</h1>
      </header>

      {evento.carregando && !dados && <Esqueleto quantidade={2} altura={110} />}
      {evento.erro && <EstadoErro mensagem={evento.erro} aoTentar={evento.recarregar} />}

      {dados && (
        <>
          <section className="cartao entra mt-4 p-4" style={cliente ? { borderLeft: `5px solid ${cliente.cor}` } : undefined}>
            {cliente && (
              <p className="mb-3 flex items-center gap-3 font-bold">
                <AvatarCliente cliente={cliente} tamanho={44} />
                {cliente.nome}
              </p>
            )}
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 font-semibold first-letter:uppercase">
                <CalendarClock size={18} className="text-accent-text" aria-hidden="true" />
                {formatarDiaLongo(chaveDia(dados.inicio))}
              </p>
              <SeloStatus status={dados.status} />
            </div>
            <p className="mt-1 text-muted tabular-nums">{formatarHorario(dados.inicio, dados.fim)}</p>
            {dados.local && (
              <p className="mt-1 flex items-center gap-1.5 text-muted">
                <MapPin size={16} aria-hidden="true" /> {dados.local}
              </p>
            )}
          </section>

          <section className="mt-6" aria-labelledby="equip">
            <h2 id="equip" className="mb-3 text-xl font-bold">
              Equipamentos reservados
            </h2>

            {dados.reservas.length === 0 && <p className="text-sm text-muted">Nenhum equipamento reservado ainda.</p>}
            <ul className="space-y-2">
              {dados.reservas.map((reserva) => (
                <li key={reserva.equipamentoID} className="cartao flex items-center gap-3 px-4 py-2">
                  <span className="min-w-0 flex-1 font-semibold">{reserva.nome}</span>
                  {editavel && (
                    <button type="button" className="btn-suave !px-3" aria-label={`Liberar ${reserva.nome}`} onClick={() => liberar(reserva.equipamentoID)} disabled={ocupado}>
                      <X size={18} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {editavel && (
              <div className="mt-4">
                <label htmlFor="novo-equip" className="mb-1.5 block text-sm font-semibold">
                  Reservar equipamento
                </label>
                <div className="flex gap-2">
                  <select id="novo-equip" className="campo" value={escolhido} onChange={(e) => setEscolhido(e.target.value)} disabled={equipamentos.carregando || ocupado}>
                    <option value="">{disponiveis.length === 0 ? 'Nenhum disponível' : 'Escolha um equipamento'}</option>
                    {gruposDisponiveis.map(([categoria, itens]) => (
                      <optgroup key={categoria} label={categoria}>
                        {itens.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nome}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="button" className="btn-ouro !px-4" onClick={reservar} disabled={!escolhido || ocupado} aria-label="Reservar">
                    <Plus size={22} aria-hidden="true" />
                  </button>
                </div>
                {disponiveis.length === 0 && !equipamentos.carregando && (
                  <p className="mt-2 text-sm text-muted">
                    Cadastre equipamentos em <Link to="/cadastros" className="font-semibold text-accent-text">Cadastros</Link>.
                  </p>
                )}
              </div>
            )}

            {erro && (
              <p role="alert" className="mt-3 rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
                {erro}
              </p>
            )}
          </section>

          {editavel && (
            <section className="mt-8 space-y-3" aria-label="Ações da gravação">
              <button type="button" className="btn-ouro w-full" onClick={() => { setErroAcao(null); setAcao('concluir'); }}>
                <CheckCircle2 size={20} aria-hidden="true" /> Concluir gravação
              </button>
              <button type="button" className="btn-suave w-full !text-[#d9747c]" onClick={() => { setErroAcao(null); setAcao('cancelar'); }}>
                Cancelar gravação
              </button>
            </section>
          )}
        </>
      )}

      {acao && (
        <Confirmar
          titulo={acao === 'concluir' ? 'Concluir a gravação?' : 'Cancelar a gravação?'}
          texto={
            acao === 'concluir'
              ? 'Ela passa para "Realizado" e os avisos desta gravação param de chegar.'
              : 'Os equipamentos reservados são liberados e os avisos desta gravação param. Essa ação não pode ser desfeita.'
          }
          rotulo={acao === 'concluir' ? 'Concluir' : 'Cancelar gravação'}
          carregando={ocupado}
          erro={erroAcao}
          aoConfirmar={confirmarAcao}
          aoCancelar={() => setAcao(null)}
        />
      )}
    </main>
  );
}
