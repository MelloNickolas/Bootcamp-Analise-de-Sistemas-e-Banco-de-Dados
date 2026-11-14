namespace Tomodachi.Repository.DTOs.Eventos;

public class EventoRequest
{
  public string Titulo { get; set; } = string.Empty;
  public int LocalID { get; set; }
  public DateTime Inicio { get; set; }
  public DateTime Fim { get; set; }
  public string? Status { get; set; }
}

public class ReservaRequest
{
  public int EventoID { get; set; }
  public int EquipamentoID { get; set; }
}

public class EventoResponse
{
  public int ID { get; set; }
  public string Titulo { get; set; } = string.Empty;
  public int LocalID { get; set; }
  public string? Local { get; set; }
  public DateTime Inicio { get; set; }
  public DateTime Fim { get; set; }
  public string Status { get; set; } = string.Empty;
  public List<string> Equipamentos { get; set; } = new();
}
