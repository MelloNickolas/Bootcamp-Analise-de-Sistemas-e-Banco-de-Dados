import { Bell, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Cabecalho } from '../components/Cabecalho';
import { useCarregar } from '../hooks/useCarregar';
import LocalApi from '../services/localApi';

export default function Ajustes() {
  const saude = useCarregar(() => LocalApi.saude(), []);
  const conectado = saude.dados === true;

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
          <Bell className="mt-0.5 text-accent-text" aria-hidden="true" />
          <div className="flex-1">
            <h2 id="avisos" className="font-bold">
              Notificações
            </h2>
            <p className="mt-1 text-sm text-muted">
              Os avisos chegam 48 horas antes e repetem a cada 2 horas. A ativação no seu iPhone entra na próxima etapa.
            </p>
            <button type="button" className="btn-suave mt-3" disabled>
              Ativar notificações (em breve)
            </button>
          </div>
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
            </ol>
            <p className="mt-2 text-sm text-muted">Instalado, o app abre em tela cheia e recebe as notificações.</p>
          </div>
        </div>
      </section>
    </>
  );
}
