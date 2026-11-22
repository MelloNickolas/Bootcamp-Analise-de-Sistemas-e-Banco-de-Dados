import { api } from '../lib/api';
import type { Categoria } from '../lib/tipos';

const CategoriaApi = {
  async listar(): Promise<Categoria[]> {
    return (await api.get('/Categoria/ListarCategorias')).data;
  },
  async criar(nome: string): Promise<number> {
    return (await api.post('/Categoria/CriarCategoria', { nome })).data;
  },
  async atualizar(id: number, nome: string): Promise<void> {
    await api.put(`/Categoria/AtualizarCategoria/${id}`, { nome });
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/Categoria/DeletarCategoria/${id}`);
  }
};

export default CategoriaApi;
