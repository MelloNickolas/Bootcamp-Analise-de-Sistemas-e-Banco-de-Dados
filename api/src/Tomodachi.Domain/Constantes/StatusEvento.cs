namespace Tomodachi.Domain.Constantes;

public static class StatusEvento
{
  public const string Agendado = "agendado";
  public const string Realizado = "realizado";
  public const string Cancelado = "cancelado";

  public static readonly string[] Todos = { Agendado, Realizado, Cancelado };
}
