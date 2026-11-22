namespace Tomodachi.Repository.DTOs.Clientes;

public class ClienteRequest
{
  public string Nome { get; set; } = string.Empty;
  public string Cor { get; set; } = "#D6BD87";
  public string? Logo { get; set; }
}

public class ClienteResponse
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
  public string Cor { get; set; } = string.Empty;
  public string? Logo { get; set; }
}
