using Tomodachi.Application.Models;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface INotificacaoApplication
{
  Task<IEnumerable<Notificacao>> ListarAbertasAsync();
  Task ConfirmarAsync(int id);
  Task<ResultadoProcessamento> ProcessarPendentesAsync();
}
