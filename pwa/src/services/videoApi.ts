import { api } from '../lib/api';
import type { StatusVideo, Video } from '../lib/tipos';

export interface NovoVideo {
  titulo: string;
  eventoID: number | null;
  prazoEdicao: string;
  prazoEntrega: string;
}

const VideoApi = {
  async listar(status?: StatusVideo): Promise<Video[]> {
    return (await api.get('/Video/ListarVideos', { params: status ? { status } : undefined })).data;
  },
  async criar(video: NovoVideo): Promise<number> {
    return (await api.post('/Video/CriarVideo', video)).data;
  },
  async alterarStatus(id: number, status: StatusVideo): Promise<void> {
    await api.put(`/Video/AlterarStatusVideo/${id}`, { status });
  }
};

export default VideoApi;
