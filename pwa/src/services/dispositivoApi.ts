import { api } from '../lib/api';

const DispositivoApi = {
  async registrar(tokenFcm: string, nomeAparelho: string): Promise<number> {
    return (await api.post('/Dispositivo/RegistrarDispositivo', { tokenFcm, nomeAparelho })).data;
  }
};

export default DispositivoApi;
