using Tomodachi.Domain.Constantes;

namespace Tomodachi.Domain.Entities;

public class Video
{
  public int ID { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public int? EventoID { get; set; }
  public string Status { get; set; } = StatusVideo.AEditar;
  public DateTime PrazoEdicao { get; set; }
  public DateTime PrazoEntrega { get; set; }

  public EventoGravacao? Evento { get; set; }
}
