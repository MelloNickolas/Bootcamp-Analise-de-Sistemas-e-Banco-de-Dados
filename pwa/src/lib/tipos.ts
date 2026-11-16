export type StatusEvento = 'agendado' | 'realizado' | 'cancelado';
export type StatusVideo = 'a_editar' | 'em_edicao' | 'entregue';

export interface Evento {
  id: number;
  titulo: string;
  localID: number;
  local: string | null;
  inicio: string;
  fim: string;
  status: StatusEvento;
  equipamentos: string[];
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
