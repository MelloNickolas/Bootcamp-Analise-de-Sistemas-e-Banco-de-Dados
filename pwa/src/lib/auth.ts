const CHAVE = 'tomodachi:token';

export function obterToken(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function guardarSessao(token: string) {
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    // sem armazenamento, o app pede a senha de novo na próxima abertura
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada a limpar
  }
}

export function estaAutenticado(): boolean {
  return Boolean(obterToken());
}
