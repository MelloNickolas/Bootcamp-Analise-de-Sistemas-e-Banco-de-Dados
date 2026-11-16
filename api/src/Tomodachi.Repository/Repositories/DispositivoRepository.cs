using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class DispositivoRepository : BaseRepository, IDispositivoRepository
{
  public DispositivoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Dispositivo dispositivo)
  {
    _context.Dispositivos.Add(dispositivo);
    await _context.SaveChangesAsync();
    return dispositivo.ID;
  }

  public async Task AtualizarAsync(Dispositivo dispositivo)
  {
    _context.Dispositivos.Update(dispositivo);
    await _context.SaveChangesAsync();
  }

  public async Task<Dispositivo?> ObterPorIdAsync(int id)
    => await _context.Dispositivos.FirstOrDefaultAsync(dispositivo => dispositivo.ID == id);

  public async Task<Dispositivo?> ObterPorTokenAsync(string tokenFcm)
    => await _context.Dispositivos.FirstOrDefaultAsync(dispositivo => dispositivo.TokenFcm == tokenFcm);

  public async Task<IEnumerable<Dispositivo>> ListarAsync()
    => await _context.Dispositivos.AsNoTracking().OrderBy(dispositivo => dispositivo.ID).ToListAsync();

  public async Task DeletarAsync(Dispositivo dispositivo)
  {
    _context.Dispositivos.Remove(dispositivo);
    await _context.SaveChangesAsync();
  }
}
