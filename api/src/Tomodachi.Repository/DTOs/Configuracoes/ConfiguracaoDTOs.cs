namespace Tomodachi.Repository.DTOs.Configuracoes;

public class SilencioRequest
{
  public bool Ativo { get; set; }
  public int Inicio { get; set; }
  public int Fim { get; set; }
}

public class SilencioResponse
{
  public bool Ativo { get; set; }
  public int Inicio { get; set; }
  public int Fim { get; set; }
}
