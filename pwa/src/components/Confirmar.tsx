import { Folha } from './Folha';

// Confirmação antes de uma ação que não dá para desfazer
export function Confirmar({
  titulo,
  texto,
  rotulo,
  carregando,
  erro,
  aoConfirmar,
  aoCancelar
}: {
  titulo: string;
  texto: string;
  rotulo: string;
  carregando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  return (
    <Folha titulo={titulo} aoFechar={aoCancelar}>
      <p className="text-muted">{texto}</p>
      {erro && (
        <p role="alert" className="mt-3 rounded-2xl border border-[#c2575f]/40 bg-[#c2575f]/10 px-4 py-3 text-sm">
          {erro}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className="btn-suave" onClick={aoCancelar} disabled={carregando}>
          Voltar
        </button>
        <button type="button" className="btn-ouro !px-4" onClick={aoConfirmar} disabled={carregando}>
          {carregando ? 'Aguarde...' : rotulo}
        </button>
      </div>
    </Folha>
  );
}
