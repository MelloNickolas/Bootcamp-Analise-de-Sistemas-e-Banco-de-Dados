namespace Tomodachi.Domain.Entities;

public class Dispositivo
{
  public int ID { get; set; }
  public string TokenFcm { get; set; } = string.Empty;
  public string? NomeAparelho { get; set; }
}
