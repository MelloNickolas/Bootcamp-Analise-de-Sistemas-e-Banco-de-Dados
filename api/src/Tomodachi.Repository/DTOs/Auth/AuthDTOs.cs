namespace Tomodachi.Repository.DTOs.Auth;

public class LoginRequest
{
  public string Senha { get; set; } = string.Empty;
}

public class LoginResponse
{
  public string Token { get; set; } = string.Empty;
  public DateTime ExpiraEm { get; set; }
}
