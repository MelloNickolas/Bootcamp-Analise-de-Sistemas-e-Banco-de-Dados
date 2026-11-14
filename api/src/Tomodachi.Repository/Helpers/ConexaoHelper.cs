using System.Text;

namespace Tomodachi.Repository.Helpers;

public static class ConexaoHelper
{
  // Aceita a conexão no formato chave=valor (local) ou em URI "postgresql://..." (Neon) e devolve chave=valor.
  public static string Normalizar(string? conexao)
  {
    if (string.IsNullOrWhiteSpace(conexao))
      throw new Exception("Defina CONNECTION_STRING no arquivo .env (veja api/.env.example).");

    if (!conexao.StartsWith("postgres://") && !conexao.StartsWith("postgresql://"))
      return conexao;

    var uri = new Uri(conexao);
    var usuario = uri.UserInfo.Split(':', 2);

    var resultado = new StringBuilder();
    resultado.Append($"Host={uri.Host};");
    resultado.Append($"Port={(uri.Port > 0 ? uri.Port : 5432)};");
    resultado.Append($"Database={uri.AbsolutePath.Trim('/')};");
    resultado.Append($"Username={Uri.UnescapeDataString(usuario[0])};");
    if (usuario.Length > 1) resultado.Append($"Password={Uri.UnescapeDataString(usuario[1])};");
    resultado.Append("SSL Mode=Require;Trust Server Certificate=true");
    return resultado.ToString();
  }
}
