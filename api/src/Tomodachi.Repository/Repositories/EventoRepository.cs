using Microsoft.EntityFrameworkCore;
using Npgsql;
using Tomodachi.Domain.Constantes;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class EventoRepository : BaseRepository, IEventoRepository
{
  public EventoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(EventoGravacao evento)
  {
    _context.Eventos.Add(evento);
    await _context.SaveChangesAsync();
    return evento.ID;
  }

  public async Task AtualizarAsync(EventoGravacao evento)
  {
    try
    {
      _context.Eventos.Update(evento);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<EventoGravacao?> ObterPorIdAsync(int id)
    => await _context.Eventos
        .Include(evento => evento.Local)
        .Include(evento => evento.Reservas).ThenInclude(reserva => reserva.Equipamento)
        .AsNoTracking()
        .FirstOrDefaultAsync(evento => evento.ID == id);

  public async Task<IEnumerable<EventoGravacao>> ListarPorPeriodoAsync(DateTime inicioUtc, DateTime fimUtc)
    => await _context.Eventos
        .Include(evento => evento.Local)
        .Include(evento => evento.Reservas).ThenInclude(reserva => reserva.Equipamento)
        .AsNoTracking()
        .Where(evento => evento.Inicio >= inicioUtc && evento.Inicio < fimUtc && evento.Status != StatusEvento.Cancelado)
        .OrderBy(evento => evento.Inicio)
        .ToListAsync();

  public async Task<int> SalvarReservaAsync(ReservaEquipamento reserva)
  {
    try
    {
      _context.Reservas.Add(reserva);
      await _context.SaveChangesAsync();
      return reserva.ID;
    }
    catch (DbUpdateException ex)
    {
      throw TraduzirErro(ex);
    }
  }

  public async Task<ReservaEquipamento?> ObterReservaAsync(int eventoID, int equipamentoID)
    => await _context.Reservas.FirstOrDefaultAsync(reserva => reserva.EventoID == eventoID && reserva.EquipamentoID == equipamentoID);

  public async Task DeletarReservaAsync(ReservaEquipamento reserva)
  {
    _context.Reservas.Remove(reserva);
    await _context.SaveChangesAsync();
  }

  #region Úteis
  // Converte as regras do banco (conflito de horário, reserva repetida) em mensagens para o usuário.
  private static Exception TraduzirErro(DbUpdateException ex)
  {
    if (ex.InnerException is PostgresException erro)
    {
      if (erro.SqlState == PostgresErrorCodes.ExclusionViolation)
        return new Exception("Esse equipamento já está reservado em outro evento nesse horário.");
      if (erro.SqlState == PostgresErrorCodes.UniqueViolation)
        return new Exception("Esse equipamento já está reservado neste evento.");
      if (erro.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        return new Exception("Evento, local ou equipamento não localizado.");
    }
    return ex;
  }
  #endregion
}
