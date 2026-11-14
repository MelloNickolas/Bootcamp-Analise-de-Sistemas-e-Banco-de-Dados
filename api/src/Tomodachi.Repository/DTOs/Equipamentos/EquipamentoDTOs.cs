namespace Tomodachi.Repository.DTOs.Equipamentos;

public class EquipamentoRequest
{
  public string Nome { get; set; } = string.Empty;
  public string? Descricao { get; set; }
  public bool Ativo { get; set; } = true;
}

public class EquipamentoResponse
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string? Descricao { get; set; }
  public bool Ativo { get; set; }
}
