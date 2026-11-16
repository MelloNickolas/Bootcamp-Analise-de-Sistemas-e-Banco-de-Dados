using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class DispositivoApplication : IDispositivoApplication
{
  private readonly IDispositivoRepository _dispositivoRepository;
  public DispositivoApplication(IDispositivoRepository dispositivoRepository) => _dispositivoRepository = dispositivoRepository;

  // Se o aparelho já está cadastrado (mesmo token), só atualiza o nome.
  public async Task<int> RegistrarAsync(Dispositivo dispositivo)
  {
    if (dispositivo == null || string.IsNullOrWhiteSpace(dispositivo.TokenFcm))
      throw new Exception("O token do aparelho não pode ser vazio.");

    var existente = await _dispositivoRepository.ObterPorTokenAsync(dispositivo.TokenFcm);
    if (existente != null)
    {
      existente.NomeAparelho = dispositivo.NomeAparelho;
      await _dispositivoRepository.AtualizarAsync(existente);
      return existente.ID;
    }
    return await _dispositivoRepository.SalvarAsync(dispositivo);
  }

  public async Task<IEnumerable<Dispositivo>> ListarAsync() => await _dispositivoRepository.ListarAsync();

  public async Task RemoverAsync(int id)
  {
    var existente = await _dispositivoRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Aparelho não localizado.");
    await _dispositivoRepository.DeletarAsync(existente);
  }
}
