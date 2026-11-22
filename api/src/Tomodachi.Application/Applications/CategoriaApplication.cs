using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class CategoriaApplication : ICategoriaApplication
{
  private readonly ICategoriaRepository _categoriaRepository;
  public CategoriaApplication(ICategoriaRepository categoriaRepository) => _categoriaRepository = categoriaRepository;

  public async Task<int> CriarCategoriaAsync(CategoriaEquipamento categoria)
  {
    if (categoria == null) throw new Exception("Categoria não pode ser vazia.");
    ValidarInformacoes(categoria);
    return await _categoriaRepository.SalvarAsync(categoria);
  }

  public async Task AtualizarCategoriaAsync(CategoriaEquipamento categoria)
  {
    var existente = await ValidarExistentePorId(categoria.ID);
    ValidarInformacoes(categoria);
    existente.Nome = categoria.Nome;
    await _categoriaRepository.AtualizarAsync(existente);
  }

  public async Task<IEnumerable<CategoriaEquipamento>> ListarCategoriasAsync() => await _categoriaRepository.ListarAsync();

  public async Task DeletarCategoriaAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    await _categoriaRepository.DeletarAsync(existente);
  }

  #region Úteis
  private static void ValidarInformacoes(CategoriaEquipamento categoria)
  {
    if (string.IsNullOrWhiteSpace(categoria.Nome))
      throw new Exception("O nome da categoria não pode ser vazio.");
  }

  private async Task<CategoriaEquipamento> ValidarExistentePorId(int id)
  {
    var existente = await _categoriaRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Categoria não localizada.");
    return existente;
  }
  #endregion
}
