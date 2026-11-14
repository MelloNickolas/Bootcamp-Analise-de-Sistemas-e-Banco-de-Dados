using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class LocalApplication : ILocalApplication
{
  private readonly ILocalRepository _localRepository;
  public LocalApplication(ILocalRepository localRepository) => _localRepository = localRepository;

  public async Task<int> CriarLocalAsync(Local local)
  {
    if (local == null) throw new Exception("Local não pode ser vazio.");
    ValidarInformacoes(local);
    return await _localRepository.SalvarAsync(local);
  }

  public async Task AtualizarLocalAsync(Local local)
  {
    var existente = await ValidarExistentePorId(local.ID);
    ValidarInformacoes(local);
    existente.Nome = local.Nome;
    existente.Endereco = local.Endereco;
    await _localRepository.AtualizarAsync(existente);
  }

  public async Task<Local> ObterLocalPorIdAsync(int id) => await ValidarExistentePorId(id);
  public async Task<IEnumerable<Local>> ListarLocaisAsync() => await _localRepository.ListarAsync();

  public async Task DeletarLocalAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    await _localRepository.DeletarAsync(existente);
  }

  #region Úteis
  private static void ValidarInformacoes(Local local)
  {
    if (string.IsNullOrWhiteSpace(local.Nome))
      throw new Exception("O nome do local não pode ser vazio.");
  }
  private async Task<Local> ValidarExistentePorId(int id)
  {
    var existente = await _localRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Local não localizado.");
    return existente;
  }
  #endregion
}
