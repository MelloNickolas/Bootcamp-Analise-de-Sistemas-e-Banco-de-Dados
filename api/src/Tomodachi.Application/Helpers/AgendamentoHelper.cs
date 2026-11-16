namespace Tomodachi.Application.Helpers;

public static class AgendamentoHelper
{
  public const int HorasAntecedencia = 48;
  public const int HorasRepeticao = 2;

  // Primeiro envio: 48 horas antes do alvo. Se já passou desse ponto, envia logo.
  public static DateTime PrimeiroEnvio(DateTime alvo)
  {
    var envio = alvo.ToUniversalTime().AddHours(-HorasAntecedencia);
    var agora = DateTime.UtcNow;
    return envio < agora ? agora : envio;
  }

  // Data e hora no horário de Brasília, para as mensagens.
  public static string DataLocal(DateTime data)
  {
    var fuso = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
    var local = TimeZoneInfo.ConvertTimeFromUtc(data.ToUniversalTime(), fuso);
    return local.ToString("dd/MM 'às' HH:mm");
  }
}
