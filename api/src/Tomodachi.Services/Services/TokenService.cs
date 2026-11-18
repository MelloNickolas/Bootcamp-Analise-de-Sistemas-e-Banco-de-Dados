using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Tomodachi.Services.Interfaces;

namespace Tomodachi.Services.Services;

public class TokenService : ITokenService
{
  private readonly SymmetricSecurityKey _chave;
  private readonly int _dias;

  public TokenService(string segredo, int diasDeValidade)
  {
    _chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(segredo));
    _dias = diasDeValidade;
  }

  public (string Token, DateTime ExpiraEm) Gerar()
  {
    var expiraEm = DateTime.UtcNow.AddDays(_dias);
    var token = new JwtSecurityToken(
      claims: new[] { new Claim(JwtRegisteredClaimNames.Sub, "equipe") },
      expires: expiraEm,
      signingCredentials: new SigningCredentials(_chave, SecurityAlgorithms.HmacSha256));
    return (new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
  }
}
