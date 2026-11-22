using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.DTOs.Categorias;

namespace Tomodachi.API.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class CategoriaController : ControllerBase
{
  private readonly ICategoriaApplication _categoriaApplication;
  public CategoriaController(ICategoriaApplication categoriaApplication) => _categoriaApplication = categoriaApplication;

  [HttpGet]
  [Route("ListarCategorias")]
  public async Task<ActionResult> ListarCategorias()
  {
    try { return Ok((await _categoriaApplication.ListarCategoriasAsync()).Select(MapearResponse)); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPost]
  [Route("CriarCategoria")]
  public async Task<ActionResult> CriarCategoria([FromBody] CategoriaRequest request)
  {
    try { return Ok(await _categoriaApplication.CriarCategoriaAsync(new CategoriaEquipamento { Nome = request.Nome })); }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpPut]
  [Route("AtualizarCategoria/{id}")]
  public async Task<ActionResult> AtualizarCategoria(int id, [FromBody] CategoriaRequest request)
  {
    try
    {
      await _categoriaApplication.AtualizarCategoriaAsync(new CategoriaEquipamento { ID = id, Nome = request.Nome });
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  [HttpDelete]
  [Route("DeletarCategoria/{id}")]
  public async Task<ActionResult> DeletarCategoria(int id)
  {
    try
    {
      await _categoriaApplication.DeletarCategoriaAsync(id);
      return Ok();
    }
    catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
  }

  private static CategoriaResponse MapearResponse(CategoriaEquipamento categoria) => new() { ID = categoria.ID, Nome = categoria.Nome };
}
