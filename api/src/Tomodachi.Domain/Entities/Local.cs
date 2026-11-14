namespace Tomodachi.Domain.Entities;

public class Local
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string? Endereco { get; set; }
}
