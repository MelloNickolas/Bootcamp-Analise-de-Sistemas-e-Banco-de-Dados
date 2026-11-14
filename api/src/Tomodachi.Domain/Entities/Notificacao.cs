namespace Tomodachi.Domain.Entities;

public class Notificacao
{
  public int ID { get; set; }
  public int? EventoID { get; set; }
  public int? VideoID { get; set; }
  public string Tipo { get; set; } = string.Empty;
  public DateTime ProximoEnvio { get; set; }
  public bool Repete { get; set; } = true;
  public DateTime? ConfirmadaEm { get; set; }

  public EventoGravacao? Evento { get; set; }
  public Video? Video { get; set; }
}
