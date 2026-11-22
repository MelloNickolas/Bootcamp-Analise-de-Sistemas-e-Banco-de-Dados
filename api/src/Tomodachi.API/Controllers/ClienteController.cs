using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Clientes;

namespace Tomodachi.API.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ClienteController : ControllerBase
{
  private readonly IClienteApplication _clienteApplication;
  public ClienteController(IClienteApplication clienteApplication) => _clienteApplication = clienteApplication;

  [HttpGet]
  [Route("ListarClientes")]
  public async Task<ActionResult> ListarClientes()
  {
    try { return Ok((await _clienteApplication.ListarClientesAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpGet]
  [Route("ObterCliente/{id}")]
  public async Task<ActionResult> ObterCliente(int id)
  {
    try { return Ok(MapearResponse(await _clienteApplication.ObterClientePorIdAsync(id))); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPost]
  [Route("CriarCliente")]
  public async Task<ActionResult> CriarCliente([FromBody] ClienteRequest request)
  {
    try
    {
      var cliente = new Cliente { Nome = request.Nome, Cor = request.Cor, Logo = request.Logo };
      return Ok(await _clienteApplication.CriarClienteAsync(cliente));
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarCliente/{id}")]
  public async Task<ActionResult> AtualizarCliente(int id, [FromBody] ClienteRequest request)
  {
    try
    {
      await _clienteApplication.AtualizarClienteAsync(new Cliente { ID = id, Nome = request.Nome, Cor = request.Cor, Logo = request.Logo });
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("DeletarCliente/{id}")]
  public async Task<ActionResult> DeletarCliente(int id)
  {
    try
    {
      await _clienteApplication.DeletarClienteAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static ClienteResponse MapearResponse(Cliente cliente) => new()
  { ID = cliente.ID, Nome = cliente.Nome, Cor = cliente.Cor, Logo = cliente.Logo };
}
