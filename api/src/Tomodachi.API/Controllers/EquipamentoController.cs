using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Equipamentos;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class EquipamentoController : ControllerBase
{
  private readonly IEquipamentoApplication _equipamentoApplication;
  public EquipamentoController(IEquipamentoApplication equipamentoApplication) => _equipamentoApplication = equipamentoApplication;

  [HttpGet]
  [Route("ListarEquipamentos")]
  public async Task<ActionResult> ListarEquipamentos()
  {
    try { return Ok((await _equipamentoApplication.ListarEquipamentosAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ObterEquipamento/{id}")]
  public async Task<ActionResult> ObterEquipamento(int id)
  {
    try { return Ok(MapearResponse(await _equipamentoApplication.ObterEquipamentoPorIdAsync(id))); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPost]
  [Route("CriarEquipamento")]
  public async Task<ActionResult> CriarEquipamento([FromBody] EquipamentoRequest request)
  {
    try
    {
      var equipamento = new Equipamento { Nome = request.Nome, Descricao = request.Descricao, Ativo = request.Ativo };
      return Ok(await _equipamentoApplication.CriarEquipamentoAsync(equipamento));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarEquipamento/{id}")]
  public async Task<ActionResult> AtualizarEquipamento(int id, [FromBody] EquipamentoRequest request)
  {
    try
    {
      await _equipamentoApplication.AtualizarEquipamentoAsync(
        new Equipamento { ID = id, Nome = request.Nome, Descricao = request.Descricao, Ativo = request.Ativo });
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("DeletarEquipamento/{id}")]
  public async Task<ActionResult> DeletarEquipamento(int id)
  {
    try
    {
      await _equipamentoApplication.DeletarEquipamentoAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static EquipamentoResponse MapearResponse(Equipamento equipamento) => new()
  { ID = equipamento.ID, Nome = equipamento.Nome, Descricao = equipamento.Descricao, Ativo = equipamento.Ativo };
}
