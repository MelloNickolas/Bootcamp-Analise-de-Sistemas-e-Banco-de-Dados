import { api } from '../lib/api';
import type { Local } from '../lib/tipos';

export interface DadosLocal {
  nome: string;
  endereco: string | null;
}

const LocalApi = {
  async listar(): Promise<Local[]> {
    return (await api.get('/Local/ListarLocais')).data;
  },
  async criar(dados: DadosLocal): Promise<number> {
    return (await api.post('/Local/CriarLocal', dados)).data;
  },
  async atualizar(id: number, dados: DadosLocal): Promise<void> {
    await api.put(`/Local/AtualizarLocal/${id}`, dados);
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/Local/DeletarLocal/${id}`);
  },
  async saude(): Promise<boolean> {
    try {
      await api.get('/health', { timeout: 6000 });
      return true;
    } catch {
      return false;
    }
  }
};

export default LocalApi;
