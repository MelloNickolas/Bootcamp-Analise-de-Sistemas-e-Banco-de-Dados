import { useMemo } from 'react';
import type { Cliente } from '../lib/tipos';
import ClienteApi from '../services/clienteApi';
import { useCarregar } from './useCarregar';

// Clientes por número, para colorir e identificar as gravações. Se a busca falhar, as telas seguem sem cores.
export function useClientes() {
  const lista = useCarregar(() => ClienteApi.listar(), []);
  const mapa = useMemo(() => new Map<number, Cliente>((lista.dados ?? []).map((c) => [c.id, c])), [lista.dados]);
  return { mapa, lista: lista.dados ?? [], carregando: lista.carregando };
}
