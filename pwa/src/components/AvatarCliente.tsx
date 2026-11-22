import type { Cliente } from '../lib/tipos';
import { corDoTexto } from '../lib/cores';

// Logo do cliente num quadrinho com a cor dele; sem logo, a inicial do nome
export function AvatarCliente({ cliente, tamanho = 40 }: { cliente: Pick<Cliente, 'nome' | 'cor' | 'logo'>; tamanho?: number }) {
  const estilo = { width: tamanho, height: tamanho, borderColor: cliente.cor };
  if (cliente.logo) {
    return (
      <img
        src={cliente.logo}
        alt=""
        className="flex-none rounded-xl border-2 object-contain p-0.5"
        style={{ ...estilo, background: `color-mix(in srgb, ${cliente.cor} 16%, var(--card))` }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-xl border-2 font-display font-extrabold"
      style={{ ...estilo, background: cliente.cor, color: corDoTexto(cliente.cor), fontSize: tamanho * 0.45 }}
    >
      {cliente.nome.trim().charAt(0).toUpperCase()}
    </span>
  );
}
