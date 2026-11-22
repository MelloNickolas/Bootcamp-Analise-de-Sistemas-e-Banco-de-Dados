using System.Text.RegularExpressions;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class ClienteApplication : IClienteApplication
{
  private const int TamanhoMaximoDaLogo = 300_000; // caracteres (cerca de 200 KB de imagem)

  private readonly IClienteRepository _clienteRepository;
  public ClienteApplication(IClienteRepository clienteRepository) => _clienteRepository = clienteRepository;

  public async Task<int> CriarClienteAsync(Cliente cliente)
  {
    if (cliente == null) throw new Exception("Cliente não pode ser vazio.");
    ValidarInformacoes(cliente);
    return await _clienteRepository.SalvarAsync(cliente);
  }

  public async Task AtualizarClienteAsync(Cliente cliente)
  {
    var existente = await ValidarExistentePorId(cliente.ID);
    ValidarInformacoes(cliente);
    existente.Nome = cliente.Nome;
    existente.Cor = cliente.Cor;
    existente.Logo = cliente.Logo;
    await _clienteRepository.AtualizarAsync(existente);
  }

  public async Task<Cliente> ObterClientePorIdAsync(int id) => await ValidarExistentePorId(id);
  public async Task<IEnumerable<Cliente>> ListarClientesAsync() => await _clienteRepository.ListarAsync();

  public async Task DeletarClienteAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    await _clienteRepository.DeletarAsync(existente);
  }

  #region Úteis
  private static void ValidarInformacoes(Cliente cliente)
  {
    if (string.IsNullOrWhiteSpace(cliente.Nome))
      throw new Exception("O nome do cliente não pode ser vazio.");
    if (!Regex.IsMatch(cliente.Cor ?? string.Empty, "^#[0-9A-Fa-f]{6}$"))
      throw new Exception("A cor precisa estar no formato #RRGGBB.");
    if (!string.IsNullOrEmpty(cliente.Logo))
    {
      if (!cliente.Logo.StartsWith("data:image/"))
        throw new Exception("A logo precisa ser uma imagem.");
      if (cliente.Logo.Length > TamanhoMaximoDaLogo)
        throw new Exception("A logo está muito grande. Use uma imagem menor.");
    }
    else
    {
      cliente.Logo = null;
    }
  }

  private async Task<Cliente> ValidarExistentePorId(int id)
  {
    var existente = await _clienteRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Cliente não localizado.");
    return existente;
  }
  #endregion
}
