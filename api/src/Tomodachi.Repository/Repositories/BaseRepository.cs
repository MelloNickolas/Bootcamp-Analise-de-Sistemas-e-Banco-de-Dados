using Tomodachi.Repository.Context;

namespace Tomodachi.Repository.Repositories;

public abstract class BaseRepository
{
  protected readonly TomodachiDbContext _context;
  protected BaseRepository(TomodachiDbContext context) => _context = context;
}
