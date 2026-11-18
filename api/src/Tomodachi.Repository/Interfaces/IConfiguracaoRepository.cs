using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IConfiguracaoRepository
{
  Task<ConfiguracaoNotificacao?> ObterAsync();
  Task SalvarAsync(ConfiguracaoNotificacao configuracao);
}
