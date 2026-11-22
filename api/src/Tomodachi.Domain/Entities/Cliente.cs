namespace Tomodachi.Domain.Entities;

public class Cliente
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string Cor { get; set; } = "#D6BD87";

  // Imagem pequena em formato de texto ("data:image/...")
  public string? Logo { get; set; }
}
