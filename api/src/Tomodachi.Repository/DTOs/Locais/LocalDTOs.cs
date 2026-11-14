namespace Tomodachi.Repository.DTOs.Locais;

public class LocalRequest
{
  public string Nome { get; set; } = string.Empty;
  public string? Endereco { get; set; }
}

public class LocalResponse
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string? Endereco { get; set; }
}
