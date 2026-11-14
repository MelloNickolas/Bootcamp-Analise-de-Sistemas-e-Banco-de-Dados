using Tomodachi.Domain.Constantes;

namespace Tomodachi.Domain.Entities;

public class EventoGravacao
{
  public int ID { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public int LocalID { get; set; }
  public DateTime Inicio { get; set; }
  public DateTime Fim { get; set; }
  public string Status { get; set; } = StatusEvento.Agendado;

  public Local? Local { get; set; }
  public List<ReservaEquipamento> Reservas { get; set; } = new();
}
