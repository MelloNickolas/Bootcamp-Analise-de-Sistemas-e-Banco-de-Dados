import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5080',
  timeout: 15000
});

// Mensagem pronta para mostrar ao usuário (a API já devolve textos claros nas regras de negócio).
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const mensagem = erro.response?.data?.mensagem;
    if (typeof mensagem === 'string') return mensagem;
    if (!erro.response) return 'Não consegui falar com o servidor. Confira a conexão e tente de novo.';
  }
  return 'Algo deu errado. Tente de novo.';
}
