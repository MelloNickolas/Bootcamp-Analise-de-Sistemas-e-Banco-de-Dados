import { api } from '../lib/api';
import type { Equipamento } from '../lib/tipos';

export interface DadosEquipamento {
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

const EquipamentoApi = {
  async listar(): Promise<Equipamento[]> {
    return (await api.get('/Equipamento/ListarEquipamentos')).data;
  },
  async criar(dados: DadosEquipamento): Promise<number> {
    return (await api.post('/Equipamento/CriarEquipamento', dados)).data;
  },
  async atualizar(id: number, dados: DadosEquipamento): Promise<void> {
    await api.put(`/Equipamento/AtualizarEquipamento/${id}`, dados);
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/Equipamento/DeletarEquipamento/${id}`);
  }
};

export default EquipamentoApi;
