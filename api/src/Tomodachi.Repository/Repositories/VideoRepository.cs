using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class VideoRepository : BaseRepository, IVideoRepository
{
  public VideoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Video video)
  {
    try
    {
      _context.Videos.Add(video);
      await _context.SaveChangesAsync();
      return video.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task AtualizarAsync(Video video)
  {
    try
    {
      _context.Videos.Update(video);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<Video?> ObterPorIdAsync(int id)
    => await _context.Videos.Include(video => video.Evento).AsNoTracking().FirstOrDefaultAsync(video => video.ID == id);

  public async Task<IEnumerable<Video>> ListarAsync(string? status)
  {
    var consulta = _context.Videos.Include(video => video.Evento).AsNoTracking().AsQueryable();
    if (!string.IsNullOrWhiteSpace(status))
      consulta = consulta.Where(video => video.Status == status);
    return await consulta.OrderBy(video => video.PrazoEntrega).ToListAsync();
  }

  public async Task DeletarAsync(int id)
  {
    var video = await _context.Videos.FirstOrDefaultAsync(item => item.ID == id);
    if (video == null) return;
    _context.Videos.Remove(video);
    await _context.SaveChangesAsync();
  }

  #region Úteis
  private static Exception TraduzirErro(DbUpdateException ex)
  {
    if (ex.InnerException is PostgresException erro && erro.SqlState == PostgresErrorCodes.ForeignKeyViolation)
      return new Exception("Evento não localizado.");
    return ex;
  }
  #endregion
}
