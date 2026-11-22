namespace Tomodachi.Repository.DTOs.Categorias;

public class CategoriaRequest
{
  public string Nome { get; set; } = string.Empty;
}

public class CategoriaResponse
{
  public int ID { get; set; }
  public string Nome { get; set; } = string.Empty;
}
