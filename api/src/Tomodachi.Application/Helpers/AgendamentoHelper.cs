namespace Tomodachi.Application.Helpers;

public static class AgendamentoHelper
{
  public const int HorasAntecedencia = 48;
  public const int HorasRepeticao = 3;

  // Horário de silêncio (Brasília), definido no app: nenhum aviso sai de "inicio" até "fim".
  // O que venceu nesse período sai quando ele termina. Aceita janelas que viram a noite (ex.: 22h às 7h).
  public static bool EmHorarioDeSilencio(DateTime agoraUtc, bool ativo, int inicio, int fim)
  {
    if (!ativo || inicio == fim) return false;

    var fuso = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
    var hora = TimeZoneInfo.ConvertTimeFromUtc(agoraUtc.ToUniversalTime(), fuso).Hour;
    return inicio < fim
      ? hora >= inicio && hora < fim
      : hora >= inicio || hora < fim;
  }

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
