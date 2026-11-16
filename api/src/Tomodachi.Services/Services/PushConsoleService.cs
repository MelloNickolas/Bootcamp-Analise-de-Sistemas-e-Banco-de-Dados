using Microsoft.Extensions.Logging;
using Tomodachi.Services.Interfaces;

namespace Tomodachi.Services.Services;

// Simula o envio escrevendo no log. Será trocado pelo Firebase Cloud Messaging.
public class PushConsoleService : IPushService
{
  private readonly ILogger<PushConsoleService> _logger;
  public PushConsoleService(ILogger<PushConsoleService> logger) => _logger = logger;

  public Task<int> EnviarAsync(IEnumerable<string> tokens, string titulo, string corpo)
  {
    var lista = tokens.ToList();
    _logger.LogInformation("PUSH (simulado) para {Quantidade} aparelho(s): {Titulo} | {Corpo}", lista.Count, titulo, corpo);
    return Task.FromResult(lista.Count);
  }
}
