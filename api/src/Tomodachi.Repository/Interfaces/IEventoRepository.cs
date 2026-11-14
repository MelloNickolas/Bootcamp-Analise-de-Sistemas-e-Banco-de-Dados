using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IEventoRepository
{
  Task<int> SalvarAsync(EventoGravacao evento);
  Task AtualizarAsync(EventoGravacao evento);
  Task<EventoGravacao?> ObterPorIdAsync(int id);
  Task<IEnumerable<EventoGravacao>> ListarPorPeriodoAsync(DateTime inicioUtc, DateTime fimUtc);
  Task<int> SalvarReservaAsync(ReservaEquipamento reserva);
  Task<ReservaEquipamento?> ObterReservaAsync(int eventoID, int equipamentoID);
  Task DeletarReservaAsync(ReservaEquipamento reserva);
}
