import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, LogOut, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { limparSessao } from '../lib/auth';
import { Cabecalho } from '../components/Cabecalho';
import { CartaoSilencio } from '../components/CartaoSilencio';
import { useCarregar } from '../hooks/useCarregar';
import { mensagemDeErro } from '../lib/api';
import { firebaseConfigurado, guardarToken, nomeDoAparelho, obterTokenDePush, tokenSalvo } from '../lib/firebase';
import DispositivoApi from '../services/dispositivoApi';
import LocalApi from '../services/localApi';

export default function Ajustes() {
  const navegar = useNavigate();
  const saude = useCarregar(() => LocalApi.saude(), []);

  function sair() {
    limparSessao();
    navegar('/entrar', { replace: true });
  }
  const conectado = saude.dados === true;

  const [ativadas, setAtivadas] = useState(Boolean(tokenSalvo()));
  const [ativando, setAtivando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function ativar() {
    setAtivando(true);
    setErro(null);
    try {
      const token = await obterTokenDePush();
      await DispositivoApi.registrar(token, nomeDoAparelho());
      guardarToken(token);
      setAtivadas(true);
    } catch (e) {
      setErro(e instanceof Error && !('response' in e) ? e.message : mensagemDeErro(e));
    } finally {
      setAtivando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <h1 className="entra mt-3 text-[2rem] font-extrabold">Ajustes</h1>

      <section className="cartao entra mt-5 p-4" aria-labelledby="conexao">
        <div className="flex items-center gap-3">
          {conectado ? <Wifi className="text-[#79b5ae]" aria-hidden="true" /> : <WifiOff className="text-[#c2575f]" aria-hidden="true" />}
          <div className="flex-1">
            <h2 id="conexao" className="font-bold">
              Conexão com o servidor
            </h2>
            <p className="text-sm text-muted" aria-live="polite">
              {saude.carregando ? 'Verificando...' : conectado ? 'Conectado' : 'Sem conexão com o servidor'}
            </p>
          </div>
          <button type="button" className="btn-suave" onClick={saude.recarregar}>
            Verificar
          </button>
        </div>
      </section>

      <section className="cartao entra mt-3 p-4" style={{ animationDelay: '60ms' }} aria-labelledby="avisos">
        <div className="flex items-start gap-3">
          {ativadas ? <BellRing className="mt-0.5 text-[#79b5ae]" aria-hidden="true" /> : <Bell className="mt-0.5 text-accent-text" aria-hidden="true" />}
          <div className="flex-1">
            <h2 id="avisos" className="font-bold">
              Notificações
            </h2>
            <p className="mt-1 text-sm text-muted">
              Os avisos chegam 48 horas antes e repetem a cada 3 horas, até o item ser concluído.
            </p>

            {ativadas ? (
              <p className="mt-3 text-sm font-semibold text-[#79b5ae]" role="status">
                Ativadas neste aparelho
              </p>
            ) : (
              <button type="button" className="btn-suave mt-3" onClick={ativar} disabled={ativando || !firebaseConfigurado}>
                {ativando ? 'Ativando...' : 'Ativar notificações'}
              </button>
            )}

            {!firebaseConfigurado && !ativadas && (
              <p className="mt-2 text-sm text-muted">O Firebase ainda não foi configurado neste app.</p>
            )}
            {erro && (
              <p role="alert" className="mt-2 text-sm text-[#c2575f]">
                {erro}
              </p>
            )}
          </div>
        </div>
      </section>

      <CartaoSilencio />

      <section className="cartao entra mt-3 p-4" style={{ animationDelay: '90ms' }} aria-labelledby="conta">
        <div className="flex items-center gap-3">
          <LogOut className="text-accent-text" aria-hidden="true" />
          <div className="flex-1">
            <h2 id="conta" className="font-bold">
              Conta
            </h2>
            <p className="text-sm text-muted">Sair pede a senha da equipe de novo neste aparelho.</p>
          </div>
          <button type="button" className="btn-suave" onClick={sair}>
            Sair
          </button>
        </div>
      </section>

      <section className="cartao entra mt-3 p-4" style={{ animationDelay: '120ms' }} aria-labelledby="instalar">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 text-accent-text" aria-hidden="true" />
          <div className="flex-1">
            <h2 id="instalar" className="font-bold">
              Instalar no iPhone
            </h2>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>Abra este endereço no Safari.</li>
              <li>Toque no botão de compartilhar.</li>
              <li>Escolha &quot;Adicionar à Tela de Início&quot;.</li>
              <li>Abra o app pelo ícone e ative as notificações aqui.</li>
            </ol>
            <p className="mt-2 text-sm text-muted">No iPhone, as notificações só funcionam com o app instalado e aberto por esse ícone.</p>
          </div>
        </div>
      </section>
    </>
  );
}
