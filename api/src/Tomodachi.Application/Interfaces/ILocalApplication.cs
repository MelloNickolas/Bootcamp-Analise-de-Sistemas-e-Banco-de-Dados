using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface ILocalApplication
{
  Task<int> CriarLocalAsync(Local local);
  Task AtualizarLocalAsync(Local local);
  Task<Local> ObterLocalPorIdAsync(int id);
  Task<IEnumerable<Local>> ListarLocaisAsync();
  Task DeletarLocalAsync(int id);
}
