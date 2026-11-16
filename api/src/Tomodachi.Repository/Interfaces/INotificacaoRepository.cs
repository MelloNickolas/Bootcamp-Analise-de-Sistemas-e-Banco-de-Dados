using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface INotificacaoRepository
{
  Task<int> SalvarAsync(Notificacao notificacao);
  Task AtualizarAsync(Notificacao notificacao);
  Task<Notificacao?> ObterPorIdAsync(int id);
  Task<IEnumerable<Notificacao>> ListarPendentesAteAsync(DateTime agoraUtc);
  Task<IEnumerable<Notificacao>> ListarAbertasAsync();
  Task<IEnumerable<Notificacao>> ListarAbertasPorItemAsync(int? eventoID, int? videoID);
}
