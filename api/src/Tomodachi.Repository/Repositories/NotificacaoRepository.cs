using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class NotificacaoRepository : BaseRepository, INotificacaoRepository
{
  public NotificacaoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<int> SalvarAsync(Notificacao notificacao)
  {
    _context.Notificacoes.Add(notificacao);
    await _context.SaveChangesAsync();
    return notificacao.ID;
  }

  // Marca só a notificação como alterada (sem arrastar o evento ou o vídeo ligados a ela).
  public async Task AtualizarAsync(Notificacao notificacao)
  {
    _context.Entry(notificacao).State = EntityState.Modified;
    await _context.SaveChangesAsync();
  }

  public async Task<Notificacao?> ObterPorIdAsync(int id)
    => await _context.Notificacoes.FirstOrDefaultAsync(notificacao => notificacao.ID == id);

  public async Task<IEnumerable<Notificacao>> ListarPendentesAteAsync(DateTime agoraUtc)
    => await _context.Notificacoes
        .Include(notificacao => notificacao.Evento)
        .Include(notificacao => notificacao.Video)
        .Where(notificacao => notificacao.ConfirmadaEm == null && notificacao.ProximoEnvio <= agoraUtc)
        .OrderBy(notificacao => notificacao.ProximoEnvio)
        .ToListAsync();

  public async Task<IEnumerable<Notificacao>> ListarAbertasAsync()
    => await _context.Notificacoes
        .Include(notificacao => notificacao.Evento)
        .Include(notificacao => notificacao.Video)
        .AsNoTracking()
        .Where(notificacao => notificacao.ConfirmadaEm == null)
        .OrderBy(notificacao => notificacao.ProximoEnvio)
        .ToListAsync();

  public async Task<IEnumerable<Notificacao>> ListarAbertasPorItemAsync(int? eventoID, int? videoID)
    => await _context.Notificacoes
        .Where(notificacao => notificacao.ConfirmadaEm == null
          && ((eventoID != null && notificacao.EventoID == eventoID) || (videoID != null && notificacao.VideoID == videoID)))
        .ToListAsync();
}
