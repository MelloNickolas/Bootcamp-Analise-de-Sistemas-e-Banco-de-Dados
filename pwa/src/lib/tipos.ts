export type StatusEvento = 'agendado' | 'realizado' | 'cancelado';
export type StatusVideo = 'a_editar' | 'em_edicao' | 'entregue';

export interface Reserva {
  equipamentoID: number;
  nome: string;
}

export interface Evento {
  id: number;
  titulo: string;
  localID: number;
  clienteID: number | null;
  local: string | null;
  inicio: string;
  fim: string;
  status: StatusEvento;
  equipamentos: string[];
  reservas: Reserva[];
}

export interface Video {
  id: number;
  titulo: string;
  eventoID: number | null;
  evento: string | null;
  status: StatusVideo;
  prazoEdicao: string;
  prazoEntrega: string;
}

export interface Local {
  id: number;
  nome: string;
  endereco: string | null;
}

export interface Equipamento {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  cor: string;
  logo: string | null;
}
