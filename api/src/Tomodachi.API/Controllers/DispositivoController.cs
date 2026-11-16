using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Dispositivos;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class DispositivoController : ControllerBase
{
  private readonly IDispositivoApplication _dispositivoApplication;
  public DispositivoController(IDispositivoApplication dispositivoApplication) => _dispositivoApplication = dispositivoApplication;

  [HttpGet]
  [Route("ListarDispositivos")]
  public async Task<ActionResult> ListarDispositivos()
  {
    try { return Ok((await _dispositivoApplication.ListarAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  // O app chama quando o usuário permite as notificações, enviando o token do Firebase
  [HttpPost]
  [Route("RegistrarDispositivo")]
  public async Task<ActionResult> RegistrarDispositivo([FromBody] DispositivoRequest request)
  {
    try
    {
      var dispositivo = new Dispositivo { TokenFcm = request.TokenFcm, NomeAparelho = request.NomeAparelho };
      return Ok(await _dispositivoApplication.RegistrarAsync(dispositivo));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("RemoverDispositivo/{id}")]
  public async Task<ActionResult> RemoverDispositivo(int id)
  {
    try
    {
      await _dispositivoApplication.RemoverAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static DispositivoResponse MapearResponse(Dispositivo dispositivo) => new()
  { ID = dispositivo.ID, TokenFcm = dispositivo.TokenFcm, NomeAparelho = dispositivo.NomeAparelho };
}
