using System.Security.Cryptography;
using System.Text;
using Tomodachi.Application.Interfaces;
using Tomodachi.Services.Interfaces;

namespace Tomodachi.Application.Applications;

// Login compartilhado: a equipe inteira usa uma senha só, que fica no servidor (APP_PASSWORD).
public class AuthApplication : IAuthApplication
{
  private readonly string _senhaDaEquipe;
  private readonly ITokenService _tokenService;

  public AuthApplication(string senhaDaEquipe, ITokenService tokenService)
  {
    _senhaDaEquipe = senhaDaEquipe;
    _tokenService = tokenService;
  }

  public (string Token, DateTime ExpiraEm) Entrar(string senha)
  {
    if (string.IsNullOrEmpty(senha) || !SenhasIguais(senha, _senhaDaEquipe))
      throw new Exception("Senha incorreta.");
    return _tokenService.Gerar();
  }

  #region Úteis
  // Comparação em tempo constante, para não revelar a senha pelo tempo de resposta.
  private static bool SenhasIguais(string recebida, string esperada)
  {
    var a = SHA256.HashData(Encoding.UTF8.GetBytes(recebida));
    var b = SHA256.HashData(Encoding.UTF8.GetBytes(esperada));
    return CryptographicOperations.FixedTimeEquals(a, b);
  }
  #endregion
}
