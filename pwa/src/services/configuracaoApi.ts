import { api } from '../lib/api';

export interface Silencio {
  ativo: boolean;
  inicio: number;
  fim: number;
}

const ConfiguracaoApi = {
  async obterSilencio(): Promise<Silencio> {
    return (await api.get('/Configuracao/ObterSilencio')).data;
  },
  async atualizarSilencio(silencio: Silencio): Promise<void> {
    await api.put('/Configuracao/AtualizarSilencio', silencio);
  }
};

export default ConfiguracaoApi;
