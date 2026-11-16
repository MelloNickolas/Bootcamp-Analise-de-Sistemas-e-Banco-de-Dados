using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IDispositivoRepository
{
  Task<int> SalvarAsync(Dispositivo dispositivo);
  Task AtualizarAsync(Dispositivo dispositivo);
  Task<Dispositivo?> ObterPorIdAsync(int id);
  Task<Dispositivo?> ObterPorTokenAsync(string tokenFcm);
  Task<IEnumerable<Dispositivo>> ListarAsync();
  Task DeletarAsync(Dispositivo dispositivo);
}
