using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Eventos;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class EventoController : ControllerBase
{
  private readonly IEventoApplication _eventoApplication;
  public EventoController(IEventoApplication eventoApplication) => _eventoApplication = eventoApplication;

  // ---------- AGENDA ----------
  [HttpGet]
  [Route("ListarEventosDoDia")]
  public async Task<ActionResult> ListarEventosDoDia([FromQuery] DateOnly? data)
  {
    try { return Ok((await _eventoApplication.ListarEventosDoDiaAsync(data ?? Hoje())).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ListarEventosDaSemana")]
  public async Task<ActionResult> ListarEventosDaSemana([FromQuery] DateOnly? data)
  {
    try { return Ok((await _eventoApplication.ListarEventosDaSemanaAsync(data ?? Hoje())).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ObterEvento/{id}")]
  public async Task<ActionResult> ObterEvento(int id)
  {
    try { return Ok(MapearResponse(await _eventoApplication.ObterEventoPorIdAsync(id))); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  // ---------- EVENTOS ----------
  [HttpPost]
  [Route("CriarEvento")]
  public async Task<ActionResult> CriarEvento([FromBody] EventoRequest request)
  {
    try
    {
      var evento = new EventoGravacao { Titulo = request.Titulo, LocalID = request.LocalID, Inicio = request.Inicio, Fim = request.Fim };
      return Ok(await _eventoApplication.CriarEventoAsync(evento));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarEvento/{id}")]
  public async Task<ActionResult> AtualizarEvento(int id, [FromBody] EventoRequest request)
  {
    try
    {
      var evento = new EventoGravacao
      {
        ID = id, Titulo = request.Titulo, LocalID = request.LocalID, Inicio = request.Inicio, Fim = request.Fim, Status = request.Status ?? string.Empty
      };
      await _eventoApplication.AtualizarEventoAsync(evento);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("CancelarEvento/{id}")]
  public async Task<ActionResult> CancelarEvento(int id)
  {
    try
    {
      await _eventoApplication.CancelarEventoAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  // ---------- RESERVA DE EQUIPAMENTO ----------
  [HttpPost]
  [Route("ReservarEquipamento")]
  public async Task<ActionResult> ReservarEquipamento([FromBody] ReservaRequest request)
  {
    try { return Ok(await _eventoApplication.ReservarEquipamentoAsync(request.EventoID, request.EquipamentoID)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("LiberarEquipamento")]
  public async Task<ActionResult> LiberarEquipamento([FromQuery] int eventoID, [FromQuery] int equipamentoID)
  {
    try
    {
      await _eventoApplication.LiberarEquipamentoAsync(eventoID, equipamentoID);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  #region Úteis
  private static EventoResponse MapearResponse(EventoGravacao evento) => new()
  {
    ID = evento.ID,
    Titulo = evento.Titulo,
    LocalID = evento.LocalID,
    Local = evento.Local?.Nome,
    Inicio = evento.Inicio.ToUniversalTime(),
    Fim = evento.Fim.ToUniversalTime(),
    Status = evento.Status,
    Equipamentos = evento.Reservas
      .Where(reserva => reserva.Ativa && reserva.Equipamento != null)
      .Select(reserva => reserva.Equipamento!.Nome)
      .OrderBy(nome => nome)
      .ToList()
  };

  private static DateOnly Hoje()
  {
    var fuso = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
    return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTime.UtcNow, fuso));
  }
  #endregion
}
