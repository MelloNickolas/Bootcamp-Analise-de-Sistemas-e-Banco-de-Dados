using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class ConfiguracaoApplication : IConfiguracaoApplication
{
  private readonly IConfiguracaoRepository _configuracaoRepository;
  public ConfiguracaoApplication(IConfiguracaoRepository configuracaoRepository) => _configuracaoRepository = configuracaoRepository;

  // Sem linha no banco, vale o padrão (silêncio ligado, das 22h às 7h)
  public async Task<ConfiguracaoNotificacao> ObterSilencioAsync()
    => await _configuracaoRepository.ObterAsync() ?? new ConfiguracaoNotificacao();

  public async Task AtualizarSilencioAsync(bool ativo, int inicio, int fim)
  {
    ValidarHora(inicio, "O início do silêncio");
    ValidarHora(fim, "O fim do silêncio");
    if (ativo && inicio == fim)
      throw new Exception("O início e o fim do silêncio precisam ser horas diferentes.");

    await _configuracaoRepository.SalvarAsync(new ConfiguracaoNotificacao
    {
      SilencioAtivo = ativo,
      SilencioInicio = inicio,
      SilencioFim = fim
    });
  }

  #region Úteis
  private static void ValidarHora(int hora, string campo)
  {
    if (hora < 0 || hora > 23) throw new Exception($"{campo} deve ser uma hora entre 0 e 23.");
  }
  #endregion
}
