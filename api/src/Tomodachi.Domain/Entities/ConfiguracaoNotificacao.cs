namespace Tomodachi.Domain.Entities;

// Configuração única das notificações (sempre a linha de ID 1)
public class ConfiguracaoNotificacao
{
  public int ID { get; set; } = 1;
  public bool SilencioAtivo { get; set; } = true;
  public int SilencioInicio { get; set; } = 22;
  public int SilencioFim { get; set; } = 7;
}
