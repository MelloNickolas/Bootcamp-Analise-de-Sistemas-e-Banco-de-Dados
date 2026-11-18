using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Tomodachi.Application.Interfaces;
using Tomodachi.Repository.DTOs.Auth;

namespace Tomodachi.API.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
  private readonly IAuthApplication _authApplication;
  public AuthController(IAuthApplication authApplication) => _authApplication = authApplication;

  // Única rota pública (além do /health e do disparo das notificações). Limitada a poucas tentativas por minuto.
  [AllowAnonymous]
  [EnableRateLimiting("login")]
  [HttpPost]
  [Route("Login")]
  public ActionResult Login([FromBody] LoginRequest request)
  {
    try
    {
      var (token, expiraEm) = _authApplication.Entrar(request.Senha);
      return Ok(new LoginResponse { Token = token, ExpiraEm = expiraEm });
    }
    catch (Exception ex) { return Unauthorized(new { mensagem = ex.Message }); }
  }
}
