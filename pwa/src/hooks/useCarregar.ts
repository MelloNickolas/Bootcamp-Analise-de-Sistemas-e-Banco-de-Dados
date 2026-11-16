import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemDeErro } from '../lib/api';

// Busca dados quando as dependências mudam, com estados de carregando e erro.
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[]) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    buscarRef
      .current()
      .then((resultado) => {
        if (ativo) setDados(resultado);
      })
      .catch((e) => {
        if (ativo) setErro(mensagemDeErro(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
  return { dados, erro, carregando, recarregar };
}
