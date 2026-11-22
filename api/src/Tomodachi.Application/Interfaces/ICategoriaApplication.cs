using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface ICategoriaApplication
{
  Task<int> CriarCategoriaAsync(CategoriaEquipamento categoria);
  Task AtualizarCategoriaAsync(CategoriaEquipamento categoria);
  Task<IEnumerable<CategoriaEquipamento>> ListarCategoriasAsync();
  Task DeletarCategoriaAsync(int id);
}
