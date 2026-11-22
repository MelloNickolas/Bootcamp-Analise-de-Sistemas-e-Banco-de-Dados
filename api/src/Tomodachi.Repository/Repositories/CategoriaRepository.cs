using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class CategoriaRepository : BaseRepository, ICategoriaRepository
{
  public CategoriaRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(CategoriaEquipamento categoria)
  {
    try
    {
      _context.Categorias.Add(categoria);
      await _context.SaveChangesAsync();
      return categoria.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task AtualizarAsync(CategoriaEquipamento categoria)
  {
    try
    {
      _context.Categorias.Update(categoria);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<CategoriaEquipamento?> ObterPorIdAsync(int id)
    => await _context.Categorias.FirstOrDefaultAsync(categoria => categoria.ID == id);

  public async Task<IEnumerable<CategoriaEquipamento>> ListarAsync()
    => await _context.Categorias.AsNoTracking().OrderBy(categoria => categoria.Nome).ToListAsync();

  public async Task DeletarAsync(CategoriaEquipamento categoria)
  {
    _context.Categorias.Remove(categoria);
    await _context.SaveChangesAsync();
  }

  #region Úteis
  private static Exception TraduzirErro(DbUpdateException ex)
  {
    if (ex.InnerException is PostgresException erro && erro.SqlState == PostgresErrorCodes.UniqueViolation)
      return new Exception("Já existe uma categoria com esse nome.");
    return ex;
  }
  #endregion
}
