using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class EquipamentoRepository : BaseRepository, IEquipamentoRepository
{
  public EquipamentoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Equipamento equipamento)
  {
    _context.Equipamentos.Add(equipamento);
    await _context.SaveChangesAsync();
    return equipamento.ID;
  }

  public async Task AtualizarAsync(Equipamento equipamento)
  {
    _context.Equipamentos.Update(equipamento);
    await _context.SaveChangesAsync();
  }

  public async Task<Equipamento?> ObterPorIdAsync(int id)
    => await _context.Equipamentos.FirstOrDefaultAsync(equipamento => equipamento.ID == id);

  public async Task<IEnumerable<Equipamento>> ListarAsync()
    => await _context.Equipamentos.OrderBy(equipamento => equipamento.Nome).ToListAsync();

  public async Task DeletarAsync(Equipamento equipamento)
  {
    _context.Equipamentos.Remove(equipamento);
    await _context.SaveChangesAsync();
  }
}
