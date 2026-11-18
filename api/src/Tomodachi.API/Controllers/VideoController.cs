using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Videos;

namespace Tomodachi.API.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class VideoController : ControllerBase
{
  private readonly IVideoApplication _videoApplication;
  public VideoController(IVideoApplication videoApplication) => _videoApplication = videoApplication;

  // status é opcional: a_editar, em_edicao ou entregue
  [HttpGet]
  [Route("ListarVideos")]
  public async Task<ActionResult> ListarVideos([FromQuery] string? status)
  {
    try { return Ok((await _videoApplication.ListarVideosAsync(status)).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ObterVideo/{id}")]
  public async Task<ActionResult> ObterVideo(int id)
  {
    try { return Ok(MapearResponse(await _videoApplication.ObterVideoPorIdAsync(id))); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPost]
  [Route("CriarVideo")]
  public async Task<ActionResult> CriarVideo([FromBody] VideoRequest request)
  {
    try
    {
      var video = new Video { Titulo = request.Titulo, EventoID = request.EventoID, PrazoEdicao = request.PrazoEdicao, PrazoEntrega = request.PrazoEntrega };
      return Ok(await _videoApplication.CriarVideoAsync(video));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarVideo/{id}")]
  public async Task<ActionResult> AtualizarVideo(int id, [FromBody] VideoRequest request)
  {
    try
    {
      var video = new Video { ID = id, Titulo = request.Titulo, EventoID = request.EventoID, PrazoEdicao = request.PrazoEdicao, PrazoEntrega = request.PrazoEntrega };
      await _videoApplication.AtualizarVideoAsync(video);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AlterarStatusVideo/{id}")]
  public async Task<ActionResult> AlterarStatusVideo(int id, [FromBody] VideoStatusRequest request)
  {
    try
    {
      await _videoApplication.AlterarStatusAsync(id, request.Status);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("DeletarVideo/{id}")]
  public async Task<ActionResult> DeletarVideo(int id)
  {
    try
    {
      await _videoApplication.DeletarVideoAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static VideoResponse MapearResponse(Video video) => new()
  {
    ID = video.ID,
    Titulo = video.Titulo,
    EventoID = video.EventoID,
    Evento = video.Evento?.Titulo,
    Status = video.Status,
    PrazoEdicao = video.PrazoEdicao.ToUniversalTime(),
    PrazoEntrega = video.PrazoEntrega.ToUniversalTime()
  };
}
