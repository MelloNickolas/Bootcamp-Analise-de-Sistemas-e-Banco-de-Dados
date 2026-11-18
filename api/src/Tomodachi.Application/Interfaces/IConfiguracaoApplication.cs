using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IConfiguracaoApplication
{
  Task<ConfiguracaoNotificacao> ObterSilencioAsync();
  Task AtualizarSilencioAsync(bool ativo, int inicio, int fim);
}
