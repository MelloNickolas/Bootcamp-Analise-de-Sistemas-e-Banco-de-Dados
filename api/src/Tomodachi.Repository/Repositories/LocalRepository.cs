using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class LocalRepository : BaseRepository, ILocalRepository
{
  public LocalRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Local local)
  {
    _context.Locais.Add(local);
    await _context.SaveChangesAsync();
    return local.ID;
  }

  public async Task AtualizarAsync(Local local)
  {
    _context.Locais.Update(local);
    await _context.SaveChangesAsync();
  }

  public async Task<Local?> ObterPorIdAsync(int id)
    => await _context.Locais.FirstOrDefaultAsync(local => local.ID == id);

  public async Task<IEnumerable<Local>> ListarAsync()
    => await _context.Locais.OrderBy(local => local.Nome).ToListAsync();

  public async Task DeletarAsync(Local local)
  {
    _context.Locais.Remove(local);
    await _context.SaveChangesAsync();
  }
}
