import { api } from '../lib/api';
import type { Evento } from '../lib/tipos';

export interface NovoEvento {
  titulo: string;
  localID: number;
  clienteID: number | null;
  inicio: string;
  fim: string;
}

const EventoApi = {
  async listarDia(data: string): Promise<Evento[]> {
    return (await api.get('/Evento/ListarEventosDoDia', { params: { data } })).data;
  },
  async listarSemana(data: string): Promise<Evento[]> {
    return (await api.get('/Evento/ListarEventosDaSemana', { params: { data } })).data;
  },
  async listarMes(data: string): Promise<Evento[]> {
    return (await api.get('/Evento/ListarEventosDoMes', { params: { data } })).data;
  },
  async listarTodos(): Promise<Evento[]> {
    return (await api.get('/Evento/ListarEventos')).data;
  },
  async obter(id: number): Promise<Evento> {
    return (await api.get(`/Evento/ObterEvento/${id}`)).data;
  },
  async criar(evento: NovoEvento): Promise<number> {
    return (await api.post('/Evento/CriarEvento', evento)).data;
  },
  async concluir(id: number): Promise<void> {
    await api.put(`/Evento/ConcluirEvento/${id}`);
  },
  async cancelar(id: number): Promise<void> {
    await api.put(`/Evento/CancelarEvento/${id}`);
  },
  async reservarEquipamento(eventoID: number, equipamentoID: number): Promise<void> {
    await api.post('/Evento/ReservarEquipamento', { eventoID, equipamentoID });
  },
  async liberarEquipamento(eventoID: number, equipamentoID: number): Promise<void> {
    await api.delete('/Evento/LiberarEquipamento', { params: { eventoID, equipamentoID } });
  }
};

export default EventoApi;
