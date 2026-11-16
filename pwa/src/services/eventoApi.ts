import { api } from '../lib/api';
import type { Evento } from '../lib/tipos';

export interface NovoEvento {
  titulo: string;
  localID: number;
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
  async criar(evento: NovoEvento): Promise<number> {
    return (await api.post('/Evento/CriarEvento', evento)).data;
  }
};

export default EventoApi;
