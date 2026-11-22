using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class EquipamentoRepository : BaseRepository, IEquipamentoRepository
{
  public EquipamentoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Equipamento equipamento)
  {
    try
    {
      _context.Equipamentos.Add(equipamento);
      await _context.SaveChangesAsync();
      return equipamento.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex, excluindo: false);
    }
  }

  // O equipamento já vem rastreado (carregado pela Application): só marca ele, sem arrastar a categoria
  public async Task AtualizarAsync(Equipamento equipamento)
  {
    try
    {
      _context.Entry(equipamento).State = EntityState.Modified;
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex, excluindo: false);
    }
  }

  public async Task<Equipamento?> ObterPorIdAsync(int id)
    => await _context.Equipamentos.FirstOrDefaultAsync(equipamento => equipamento.ID == id);

  public async Task<IEnumerable<Equipamento>> ListarAsync()
    => await _context.Equipamentos
        .Include(equipamento => equipamento.Categoria)
        .AsNoTracking()
        .OrderBy(equipamento => equipamento.Categoria!.Nome)
        .ThenBy(equipamento => equipamento.Nome)
        .ToListAsync();

  public async Task DeletarAsync(Equipamento equipamento)
  {
    try
    {
      _context.Equipamentos.Remove(equipamento);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex, excluindo: true);
    }
  }

  #region Úteis
  private static Exception TraduzirErro(DbUpdateException ex, bool excluindo)
  {
    if (ex.InnerException is PostgresException erro)
    {
      if (erro.SqlState == PostgresErrorCodes.UniqueViolation)
        return new Exception("Já existe um equipamento com esse nome.");
      if (erro.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        return new Exception(excluindo
          ? "Este equipamento já foi usado em reservas. Desative-o em vez de excluir."
          : "Categoria não localizada.");
    }
    return ex;
  }
  #endregion
}
