using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class LocalRepository : BaseRepository, ILocalRepository
{
  public LocalRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Local local)
  {
    try
    {
      _context.Locais.Add(local);
      await _context.SaveChangesAsync();
      return local.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task AtualizarAsync(Local local)
  {
    try
    {
      _context.Locais.Update(local);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<Local?> ObterPorIdAsync(int id)
    => await _context.Locais.FirstOrDefaultAsync(local => local.ID == id);

  public async Task<IEnumerable<Local>> ListarAsync()
    => await _context.Locais.OrderBy(local => local.Nome).ToListAsync();

  public async Task DeletarAsync(Local local)
  {
    try
    {
      _context.Locais.Remove(local);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  #region Úteis
  private static Exception TraduzirErro(DbUpdateException ex)
  {
    if (ex.InnerException is PostgresException erro)
    {
      if (erro.SqlState == PostgresErrorCodes.UniqueViolation)
        return new Exception("Já existe um local com esse nome.");
      if (erro.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        return new Exception("Este local já foi usado em gravações e não pode ser excluído.");
    }
    return ex;
  }
  #endregion
}
