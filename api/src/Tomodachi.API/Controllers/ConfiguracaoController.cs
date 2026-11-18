using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Repository.DTOs.Configuracoes;

namespace Tomodachi.API.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ConfiguracaoController : ControllerBase
{
  private readonly IConfiguracaoApplication _configuracaoApplication;
  public ConfiguracaoController(IConfiguracaoApplication configuracaoApplication) => _configuracaoApplication = configuracaoApplication;

  [HttpGet]
  [Route("ObterSilencio")]
  public async Task<ActionResult> ObterSilencio()
  {
    try
    {
      var configuracao = await _configuracaoApplication.ObterSilencioAsync();
      return Ok(new SilencioResponse { Ativo = configuracao.SilencioAtivo, Inicio = configuracao.SilencioInicio, Fim = configuracao.SilencioFim });
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarSilencio")]
  public async Task<ActionResult> AtualizarSilencio([FromBody] SilencioRequest request)
  {
    try
    {
      await _configuracaoApplication.AtualizarSilencioAsync(request.Ativo, request.Inicio, request.Fim);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }
}
