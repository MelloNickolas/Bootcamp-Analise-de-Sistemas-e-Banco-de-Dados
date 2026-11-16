import { api } from '../lib/api';
import type { Local } from '../lib/tipos';

const LocalApi = {
  async listar(): Promise<Local[]> {
    return (await api.get('/Local/ListarLocais')).data;
  },
  async saude(): Promise<boolean> {
    try {
      await api.get('/health', { timeout: 6000 });
      return true;
    } catch {
      return false;
    }
  }
};

export default LocalApi;
