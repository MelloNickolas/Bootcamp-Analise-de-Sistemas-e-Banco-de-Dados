namespace Tomodachi.Domain.Entities;

public class Equipamento
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string? Descricao { get; set; }
  public bool Ativo { get; set; } = true;
}
