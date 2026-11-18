namespace Tomodachi.Services.Interfaces;

public interface ITokenService
{
  // Gera o token de acesso da equipe e informa quando ele expira.
  (string Token, DateTime ExpiraEm) Gerar();
}
