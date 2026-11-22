namespace Tomodachi.Repository.DTOs.Videos;

public class VideoRequest
{
  public string Titulo { get; set; } = string.Empty;
  public int? EventoID { get; set; }
  public DateTime PrazoEdicao { get; set; }
  public DateTime PrazoEntrega { get; set; }
}

public class VideoStatusRequest
{
  public string Status { get; set; } = string.Empty;
}

public class VideoResponse
{
  public int ID { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public int? EventoID { get; set; }
  public int? ClienteID { get; set; }
  public string? Evento { get; set; }
  public string Status { get; set; } = string.Empty;
  public DateTime PrazoEdicao { get; set; }
  public DateTime PrazoEntrega { get; set; }
}
