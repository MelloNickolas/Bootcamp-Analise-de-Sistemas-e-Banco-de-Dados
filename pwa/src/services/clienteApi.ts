import { api } from '../lib/api';
import type { Cliente } from '../lib/tipos';

export interface DadosCliente {
  nome: string;
  cor: string;
  logo: string | null;
}

const ClienteApi = {
  async listar(): Promise<Cliente[]> {
    return (await api.get('/Cliente/ListarClientes')).data;
  },
  async criar(dados: DadosCliente): Promise<number> {
    return (await api.post('/Cliente/CriarCliente', dados)).data;
  },
  async atualizar(id: number, dados: DadosCliente): Promise<void> {
    await api.put(`/Cliente/AtualizarCliente/${id}`, dados);
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/Cliente/DeletarCliente/${id}`);
  }
};

export default ClienteApi;
