namespace Tomodachi.Repository.DTOs.Dispositivos;

public class DispositivoRequest
{
  public string TokenFcm { get; set; } = string.Empty;
  public string? NomeAparelho { get; set; }
}

public class DispositivoResponse
{
  public int ID { get; set; }
  public string TokenFcm { get; set; } = string.Empty;
  public string? NomeAparelho { get; set; }
}
