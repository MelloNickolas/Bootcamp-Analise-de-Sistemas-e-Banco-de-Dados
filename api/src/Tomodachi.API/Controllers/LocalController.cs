using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Locais;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class LocalController : ControllerBase
{
  private readonly ILocalApplication _localApplication;
  public LocalController(ILocalApplication localApplication) => _localApplication = localApplication;

  [HttpGet]
  [Route("ListarLocais")]
  public async Task<ActionResult> ListarLocais()
  {
    try { return Ok((await _localApplication.ListarLocaisAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ObterLocal/{id}")]
  public async Task<ActionResult> ObterLocal(int id)
  {
    try { return Ok(MapearResponse(await _localApplication.ObterLocalPorIdAsync(id))); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPost]
  [Route("CriarLocal")]
  public async Task<ActionResult> CriarLocal([FromBody] LocalRequest request)
  {
    try
    {
      var local = new Local { Nome = request.Nome, Endereco = request.Endereco };
      return Ok(await _localApplication.CriarLocalAsync(local));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarLocal/{id}")]
  public async Task<ActionResult> AtualizarLocal(int id, [FromBody] LocalRequest request)
  {
    try
    {
      await _localApplication.AtualizarLocalAsync(new Local { ID = id, Nome = request.Nome, Endereco = request.Endereco });
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("DeletarLocal/{id}")]
  public async Task<ActionResult> DeletarLocal(int id)
  {
    try
    {
      await _localApplication.DeletarLocalAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static LocalResponse MapearResponse(Local local) => new()
  { ID = local.ID, Nome = local.Nome, Endereco = local.Endereco };
}
