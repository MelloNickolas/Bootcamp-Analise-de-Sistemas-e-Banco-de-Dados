using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IClienteApplication
{
  Task<int> CriarClienteAsync(Cliente cliente);
  Task AtualizarClienteAsync(Cliente cliente);
  Task<Cliente> ObterClientePorIdAsync(int id);
  Task<IEnumerable<Cliente>> ListarClientesAsync();
  Task DeletarClienteAsync(int id);
}
