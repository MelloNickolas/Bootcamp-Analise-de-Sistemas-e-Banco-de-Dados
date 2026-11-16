namespace Tomodachi.Repository.DTOs.Notificacoes;

public class NotificacaoResponse
{
  public int ID { get; set; }
  public string Tipo { get; set; } = string.Empty;
  public string? Item { get; set; }
  public int? EventoID { get; set; }
  public int? VideoID { get; set; }
  public DateTime ProximoEnvio { get; set; }
  public bool Repete { get; set; }
  public DateTime? ConfirmadaEm { get; set; }
}

public class ProcessamentoResponse
{
  public int Verificadas { get; set; }
  public int Enviadas { get; set; }
  public int Encerradas { get; set; }
  public string Mensagem { get; set; } = string.Empty;
}
