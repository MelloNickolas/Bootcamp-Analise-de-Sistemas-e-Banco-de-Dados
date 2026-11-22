using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IClienteRepository
{
  Task<int> SalvarAsync(Cliente cliente);
  Task AtualizarAsync(Cliente cliente);
  Task<Cliente?> ObterPorIdAsync(int id);
  Task<IEnumerable<Cliente>> ListarAsync();
  Task DeletarAsync(Cliente cliente);
}
