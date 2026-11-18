import { api } from '../lib/api';

const AuthApi = {
  async entrar(senha: string): Promise<string> {
    return (await api.post('/Auth/Login', { senha })).data.token;
  }
};

export default AuthApi;
