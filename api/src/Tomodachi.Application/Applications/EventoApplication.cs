using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Constantes;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class EventoApplication : IEventoApplication
{
  private readonly IEventoRepository _eventoRepository;
  private readonly IEquipamentoRepository _equipamentoRepository;

  public EventoApplication(IEventoRepository eventoRepository, IEquipamentoRepository equipamentoRepository)
  {
    _eventoRepository = eventoRepository;
    _equipamentoRepository = equipamentoRepository;
  }

  public async Task<int> CriarEventoAsync(EventoGravacao evento)
  {
    if (evento == null) throw new Exception("Evento não pode ser vazio.");
    ValidarInformacoes(evento);
    evento.Status = StatusEvento.Agendado;
    return await _eventoRepository.SalvarAsync(evento);
  }

  public async Task AtualizarEventoAsync(EventoGravacao evento)
  {
    var existente = await ValidarExistentePorId(evento.ID);
    ValidarInformacoes(evento);

    // Entidade nova só com os campos do evento, para não regravar as reservas carregadas.
    var atualizado = new EventoGravacao
    {
      ID = existente.ID,
      Titulo = evento.Titulo,
      LocalID = evento.LocalID,
      Inicio = evento.Inicio,
      Fim = evento.Fim,
      Status = string.IsNullOrWhiteSpace(evento.Status) ? existente.Status : evento.Status
    };
    await _eventoRepository.AtualizarAsync(atualizado);
  }

  public async Task CancelarEventoAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    if (existente.Status == StatusEvento.Cancelado) throw new Exception("O evento já está cancelado.");

    await _eventoRepository.AtualizarAsync(new EventoGravacao
    {
      ID = existente.ID,
      Titulo = existente.Titulo,
      LocalID = existente.LocalID,
      Inicio = existente.Inicio,
      Fim = existente.Fim,
      Status = StatusEvento.Cancelado
    });
  }

  public async Task<EventoGravacao> ObterEventoPorIdAsync(int id) => await ValidarExistentePorId(id);

  public async Task<IEnumerable<EventoGravacao>> ListarEventosDoDiaAsync(DateOnly data)
  {
    var (inicio, fim) = LimitesEmUtc(data, 1);
    return await _eventoRepository.ListarPorPeriodoAsync(inicio, fim);
  }

  public async Task<IEnumerable<EventoGravacao>> ListarEventosDaSemanaAsync(DateOnly data)
  {
    var segunda = data.AddDays(-(((int)data.DayOfWeek + 6) % 7));
    var (inicio, fim) = LimitesEmUtc(segunda, 7);
    return await _eventoRepository.ListarPorPeriodoAsync(inicio, fim);
  }

  public async Task<int> ReservarEquipamentoAsync(int eventoID, int equipamentoID)
  {
    var evento = await ValidarExistentePorId(eventoID);
    if (evento.Status == StatusEvento.Cancelado) throw new Exception("Não é possível reservar equipamento em evento cancelado.");

    var equipamento = await _equipamentoRepository.ObterPorIdAsync(equipamentoID);
    if (equipamento == null) throw new Exception("Equipamento não localizado.");
    if (!equipamento.Ativo) throw new Exception("O equipamento está inativo.");

    // O banco garante que o mesmo equipamento não fique em dois eventos ao mesmo tempo.
    return await _eventoRepository.SalvarReservaAsync(new ReservaEquipamento { EventoID = eventoID, EquipamentoID = equipamentoID });
  }

  public async Task LiberarEquipamentoAsync(int eventoID, int equipamentoID)
  {
    var reserva = await _eventoRepository.ObterReservaAsync(eventoID, equipamentoID);
    if (reserva == null) throw new Exception("Reserva não localizada.");
    await _eventoRepository.DeletarReservaAsync(reserva);
  }

  #region Úteis
  private static void ValidarInformacoes(EventoGravacao evento)
  {
    if (string.IsNullOrWhiteSpace(evento.Titulo))
      throw new Exception("O título do evento não pode ser vazio.");
    if (evento.Fim <= evento.Inicio)
      throw new Exception("O fim do evento deve ser depois do início.");
    if (!string.IsNullOrWhiteSpace(evento.Status) && !StatusEvento.Todos.Contains(evento.Status))
      throw new Exception("Status do evento inválido.");
  }

  private async Task<EventoGravacao> ValidarExistentePorId(int id)
  {
    var existente = await _eventoRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Evento não localizado.");
    return existente;
  }

  // Início e fim (em UTC) de um intervalo de dias no horário de Brasília.
  private static (DateTime Inicio, DateTime Fim) LimitesEmUtc(DateOnly primeiroDia, int dias)
  {
    var fuso = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
    var inicio = TimeZoneInfo.ConvertTimeToUtc(primeiroDia.ToDateTime(TimeOnly.MinValue), fuso);
    var fim = TimeZoneInfo.ConvertTimeToUtc(primeiroDia.AddDays(dias).ToDateTime(TimeOnly.MinValue), fuso);
    return (inicio, fim);
  }
  #endregion
}
