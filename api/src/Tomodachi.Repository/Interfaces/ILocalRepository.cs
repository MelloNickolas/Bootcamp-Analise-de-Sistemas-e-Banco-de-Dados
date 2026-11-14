using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface ILocalRepository
{
  Task<int> SalvarAsync(Local local);
  Task AtualizarAsync(Local local);
  Task<Local?> ObterPorIdAsync(int id);
  Task<IEnumerable<Local>> ListarAsync();
  Task DeletarAsync(Local local);
}
