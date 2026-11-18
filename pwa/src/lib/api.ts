import axios from 'axios';
import { limparSessao, obterToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5080',
  timeout: 15000
});

// Envia o token do login em todas as chamadas
api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token vencido ou inválido: volta para a tela de entrada
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const ehLogin = String(erro?.config?.url ?? '').includes('/Auth/Login');
    if (erro?.response?.status === 401 && !ehLogin) {
      limparSessao();
      if (window.location.pathname !== '/entrar') window.location.assign('/entrar');
    }
    return Promise.reject(erro);
  }
);

// Mensagem pronta para mostrar ao usuário (a API já devolve textos claros nas regras de negócio).
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const mensagem = erro.response?.data?.mensagem;
    if (typeof mensagem === 'string') return mensagem;
    if (!erro.response) return 'Não consegui falar com o servidor. Confira a conexão e tente de novo.';
  }
  return 'Algo deu errado. Tente de novo.';
}
