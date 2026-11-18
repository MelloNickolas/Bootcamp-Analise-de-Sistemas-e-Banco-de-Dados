import { useState, type FormEvent } from 'react';
import { MoonStar } from 'lucide-react';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import ConfiguracaoApi, { type Silencio } from '../services/configuracaoApi';
import { EstadoErro, Esqueleto } from './Estados';

const HORAS = Array.from({ length: 24 }, (_, h) => h);
const rotuloHora = (h: number) => `${String(h).padStart(2, '0')}:00`;

// Horário em que o app não manda avisos (vale para toda a equipe)
export function CartaoSilencio() {
  const config = useCarregar(() => ConfiguracaoApi.obterSilencio(), []);

  return (
    <section className="cartao entra mt-3 p-4" style={{ animationDelay: '75ms' }} aria-labelledby="silencio">
      <div className="flex items-start gap-3">
        <MoonStar className="mt-0.5 text-accent-text" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="silencio" className="font-bold">
            Horário de silêncio
          </h2>
          {config.carregando && <Esqueleto quantidade={1} altura={96} />}
          {config.erro && <EstadoErro mensagem={config.erro} aoTentar={config.recarregar} />}
          {config.dados && <Formulario inicial={config.dados} />}
        </div>
      </div>
    </section>
  );
}

function Formulario({ inicial }: { inicial: Silencio }) {
  const [base, setBase] = useState(inicial); // o que está salvo no servidor
  const [ativo, setAtivo] = useState(inicial.ativo);
  const [inicio, setInicio] = useState(inicial.inicio);
  const [fim, setFim] = useState(inicial.fim);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterado = ativo !== base.ativo || inicio !== base.inicio || fim !== base.fim;

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (ativo && inicio === fim) return setErro('O início e o fim precisam ser horas diferentes.');
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      await ConfiguracaoApi.atualizarSilencio({ ativo, inicio, fim });
      setBase({ ativo, inicio, fim });
      setSalvo(true);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="mt-1 space-y-4" noValidate>
      <p className="text-sm text-muted">
        {ativo
          ? `Sem avisos das ${rotuloHora(inicio)} às ${rotuloHora(fim)}. O que vencer nesse período chega às ${rotuloHora(fim)}.`
          : 'Os avisos podem chegar a qualquer hora, inclusive de madrugada.'}
      </p>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="size-5 accent-[#d6bd87]"
          checked={ativo}
          onChange={(e) => {
            setAtivo(e.target.checked);
            setSalvo(false);
          }}
        />
        <span className="font-semibold">Não enviar avisos de madrugada</span>
      </label>

      {ativo && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sil-inicio" className="mb-1.5 block text-sm font-semibold">
              Começa às
            </label>
            <select id="sil-inicio" className="campo" value={inicio} onChange={(e) => { setInicio(Number(e.target.value)); setSalvo(false); }}>
              {HORAS.map((h) => (
                <option key={h} value={h}>
                  {rotuloHora(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sil-fim" className="mb-1.5 block text-sm font-semibold">
              Termina às
            </label>
            <select id="sil-fim" className="campo" value={fim} onChange={(e) => { setFim(Number(e.target.value)); setSalvo(false); }}>
              {HORAS.map((h) => (
                <option key={h} value={h}>
                  {rotuloHora(h)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
          {erro}
        </p>
      )}
      {salvo && !alterado && (
        <p role="status" className="text-sm font-semibold text-[#79b5ae]">
          Salvo. Vale para toda a equipe.
        </p>
      )}

      <button type="submit" className="btn-suave" disabled={salvando || !alterado}>
        {salvando ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
