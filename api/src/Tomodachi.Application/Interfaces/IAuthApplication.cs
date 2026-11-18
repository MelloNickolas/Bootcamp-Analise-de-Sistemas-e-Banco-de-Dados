namespace Tomodachi.Application.Interfaces;

public interface IAuthApplication
{
  (string Token, DateTime ExpiraEm) Entrar(string senha);
}
