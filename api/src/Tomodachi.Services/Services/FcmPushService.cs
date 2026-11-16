using FirebaseAdmin.Messaging;
using Microsoft.Extensions.Logging;
using Tomodachi.Services.Interfaces;

namespace Tomodachi.Services.Services;

// Envio real pelo Firebase Cloud Messaging para os aparelhos cadastrados.
public class FcmPushService : IPushService
{
  private readonly FirebaseMessaging _messaging;
  private readonly ILogger<FcmPushService> _logger;

  public FcmPushService(FirebaseMessaging messaging, ILogger<FcmPushService> logger)
  {
    _messaging = messaging;
    _logger = logger;
  }

  public async Task<int> EnviarAsync(IEnumerable<string> tokens, string titulo, string corpo)
  {
    var lista = tokens.Distinct().ToList();
    if (lista.Count == 0) return 0;

    var mensagem = new MulticastMessage
    {
      Tokens = lista,
      Notification = new Notification { Title = titulo, Body = corpo }
    };

    var resposta = await _messaging.SendEachForMulticastAsync(mensagem);

    for (var i = 0; i < resposta.Responses.Count; i++)
    {
      var envio = resposta.Responses[i];
      if (!envio.IsSuccess)
        _logger.LogWarning("Falha ao enviar para o aparelho {Indice}: {Erro}", i + 1, envio.Exception?.MessagingErrorCode);
    }

    _logger.LogInformation("PUSH enviado: {Sucesso} de {Total} aparelho(s): {Titulo}", resposta.SuccessCount, lista.Count, titulo);
    return resposta.SuccessCount;
  }
}
