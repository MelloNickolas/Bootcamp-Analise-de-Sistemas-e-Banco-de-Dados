using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface ICategoriaRepository
{
  Task<int> SalvarAsync(CategoriaEquipamento categoria);
  Task AtualizarAsync(CategoriaEquipamento categoria);
  Task<CategoriaEquipamento?> ObterPorIdAsync(int id);
  Task<IEnumerable<CategoriaEquipamento>> ListarAsync();
  Task DeletarAsync(CategoriaEquipamento categoria);
}
