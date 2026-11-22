using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IEventoApplication
{
  Task<int> CriarEventoAsync(EventoGravacao evento);
  Task AtualizarEventoAsync(EventoGravacao evento);
  Task CancelarEventoAsync(int id);
  Task ConcluirEventoAsync(int id);
  Task<EventoGravacao> ObterEventoPorIdAsync(int id);
  Task<IEnumerable<EventoGravacao>> ListarEventosAsync();
  Task<IEnumerable<EventoGravacao>> ListarEventosDoMesAsync(DateOnly data);
  Task<IEnumerable<EventoGravacao>> ListarEventosDoDiaAsync(DateOnly data);
  Task<IEnumerable<EventoGravacao>> ListarEventosDaSemanaAsync(DateOnly data);
  Task<int> ReservarEquipamentoAsync(int eventoID, int equipamentoID);
  Task LiberarEquipamentoAsync(int eventoID, int equipamentoID);
}
