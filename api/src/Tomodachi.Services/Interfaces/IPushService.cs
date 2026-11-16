namespace Tomodachi.Services.Interfaces;

public interface IPushService
{
  // Devolve quantos aparelhos receberam o aviso.
  Task<int> EnviarAsync(IEnumerable<string> tokens, string titulo, string corpo);
}
