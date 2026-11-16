using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Notificacoes;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class NotificacaoController : ControllerBase
{
  private readonly INotificacaoApplication _notificacaoApplication;
  private readonly IConfiguration _configuration;

  public NotificacaoController(INotificacaoApplication notificacaoApplication, IConfiguration configuration)
  {
    _notificacaoApplication = notificacaoApplication;
    _configuration = configuration;
  }

  // Avisos que ainda não foram confirmados
  [HttpGet]
  [Route("ListarAbertas")]
  public async Task<ActionResult> ListarAbertas()
  {
    try { return Ok((await _notificacaoApplication.ListarAbertasAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  // Marca o item como visto no app: o aviso para de repetir
  [HttpPut]
  [Route("ConfirmarNotificacao/{id}")]
  public async Task<ActionResult> ConfirmarNotificacao(int id)
  {
    try
    {
      await _notificacaoApplication.ConfirmarAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  // Chamado a cada minuto por um agendador externo, com a chave do .env no cabeçalho X-Job-Key
  [HttpPost]
  [Route("ProcessarPendentes")]
  public async Task<ActionResult> ProcessarPendentes([FromHeader(Name = "X-Job-Key")] string? chave)
  {
    var esperada = _configuration["JOB_KEY"];
    if (string.IsNullOrWhiteSpace(esperada))
      return StatusCode(500, new { mensagem = "Defina JOB_KEY no arquivo .env." });
    if (!ChaveValida(chave, esperada))
      return Unauthorized(new { mensagem = "Chave inválida." });

    try
    {
      var resultado = await _notificacaoApplication.ProcessarPendentesAsync();
      return Ok(new ProcessamentoResponse
      {
        Verificadas = resultado.Verificadas,
        Enviadas = resultado.Enviadas,
        Encerradas = resultado.Encerradas,
        Mensagem = resultado.Mensagem
      });
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  #region Úteis
  private static bool ChaveValida(string? recebida, string esperada)
  {
    if (string.IsNullOrEmpty(recebida)) return false;
    var a = Encoding.UTF8.GetBytes(recebida);
    var b = Encoding.UTF8.GetBytes(esperada);
    return a.Length == b.Length && CryptographicOperations.FixedTimeEquals(a, b);
  }

  private static NotificacaoResponse MapearResponse(Notificacao notificacao) => new()
  {
    ID = notificacao.ID,
    Tipo = notificacao.Tipo,
    Item = notificacao.Evento?.Titulo ?? notificacao.Video?.Titulo,
    EventoID = notificacao.EventoID,
    VideoID = notificacao.VideoID,
    ProximoEnvio = notificacao.ProximoEnvio.ToUniversalTime(),
    Repete = notificacao.Repete,
    ConfirmadaEm = notificacao.ConfirmadaEm?.ToUniversalTime()
  };
  #endregion
}
