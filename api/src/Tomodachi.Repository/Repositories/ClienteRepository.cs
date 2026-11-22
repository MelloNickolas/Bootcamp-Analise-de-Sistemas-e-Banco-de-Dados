using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class ClienteRepository : BaseRepository, IClienteRepository
{
  public ClienteRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Cliente cliente)
  {
    try
    {
      _context.Clientes.Add(cliente);
      await _context.SaveChangesAsync();
      return cliente.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task AtualizarAsync(Cliente cliente)
  {
    try
    {
      _context.Clientes.Update(cliente);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<Cliente?> ObterPorIdAsync(int id)
    => await _context.Clientes.FirstOrDefaultAsync(cliente => cliente.ID == id);

  public async Task<IEnumerable<Cliente>> ListarAsync()
    => await _context.Clientes.AsNoTracking().OrderBy(cliente => cliente.Nome).ToListAsync();

  public async Task DeletarAsync(Cliente cliente)
  {
    _context.Clientes.Remove(cliente);
    await _context.SaveChangesAsync();
  }

  #region Úteis
  private static Exception TraduzirErro(DbUpdateException ex)
  {
    if (ex.InnerException is PostgresException erro && erro.SqlState == PostgresErrorCodes.UniqueViolation)
      return new Exception("Já existe um cliente com esse nome.");
    return ex;
  }
  #endregion
}
