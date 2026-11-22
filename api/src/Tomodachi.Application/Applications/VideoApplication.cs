using Tomodachi.Application.Helpers;
using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Constantes;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class VideoApplication : IVideoApplication
{
  private readonly IVideoRepository _videoRepository;
  private readonly IEventoRepository _eventoRepository;
  private readonly INotificacaoRepository _notificacaoRepository;

  public VideoApplication(IVideoRepository videoRepository, IEventoRepository eventoRepository, INotificacaoRepository notificacaoRepository)
  {
    _videoRepository = videoRepository;
    _eventoRepository = eventoRepository;
    _notificacaoRepository = notificacaoRepository;
  }

  public async Task<int> CriarVideoAsync(Video video)
  {
    if (video == null) throw new Exception("Vídeo não pode ser vazio.");
    await ValidarInformacoes(video);
    video.Status = StatusVideo.AEditar;

    var id = await _videoRepository.SalvarAsync(video);

    // Aviso do prazo de edição (uma vez) e do prazo de entrega (repete a cada 3 horas até a entrega)
    await _notificacaoRepository.SalvarAsync(new Notificacao
    {
      VideoID = id, Tipo = TipoNotificacao.PrazoEdicao, ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(video.PrazoEdicao), Repete = false
    });
    await _notificacaoRepository.SalvarAsync(new Notificacao
    {
      VideoID = id, Tipo = TipoNotificacao.PrazoEntrega, ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(video.PrazoEntrega), Repete = true
    });
    return id;
  }

  public async Task AtualizarVideoAsync(Video video)
  {
    var existente = await ValidarExistentePorId(video.ID);
    await ValidarInformacoes(video);

    await _videoRepository.AtualizarAsync(new Video
    {
      ID = existente.ID,
      Titulo = video.Titulo,
      EventoID = video.EventoID,
      Status = existente.Status,
      PrazoEdicao = video.PrazoEdicao,
      PrazoEntrega = video.PrazoEntrega
    });

    // Prazos novos: reagenda os avisos que ainda estão abertos
    foreach (var notificacao in await _notificacaoRepository.ListarAbertasPorItemAsync(null, existente.ID))
    {
      if (notificacao.Tipo == TipoNotificacao.PrazoEdicao)
        notificacao.ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(video.PrazoEdicao);
      else if (notificacao.Tipo == TipoNotificacao.PrazoEntrega)
        notificacao.ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(video.PrazoEntrega);
      await _notificacaoRepository.AtualizarAsync(notificacao);
    }
  }

  public async Task AlterarStatusAsync(int id, string status)
  {
    if (!StatusVideo.Todos.Contains(status)) throw new Exception("Status do vídeo inválido.");
    var existente = await ValidarExistentePorId(id);

    await _videoRepository.AtualizarAsync(new Video
    {
      ID = existente.ID,
      Titulo = existente.Titulo,
      EventoID = existente.EventoID,
      Status = status,
      PrazoEdicao = existente.PrazoEdicao,
      PrazoEntrega = existente.PrazoEntrega
    });

    // Voltou de "entregue" (precisa de correção): o aviso do prazo de entrega volta a valer
    if (existente.Status == StatusVideo.Entregue && status != StatusVideo.Entregue)
    {
      await _notificacaoRepository.SalvarAsync(new Notificacao
      {
        VideoID = id, Tipo = TipoNotificacao.PrazoEntrega, ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(existente.PrazoEntrega), Repete = true
      });
      if (status == StatusVideo.AEditar)
        await _notificacaoRepository.SalvarAsync(new Notificacao
        {
          VideoID = id, Tipo = TipoNotificacao.PrazoEdicao, ProximoEnvio = AgendamentoHelper.PrimeiroEnvio(existente.PrazoEdicao), Repete = false
        });
    }

    // Entregue: nenhum aviso mais. Em edição: o aviso do prazo de edição não é mais necessário.
    foreach (var notificacao in await _notificacaoRepository.ListarAbertasPorItemAsync(null, existente.ID))
    {
      var encerrar = status == StatusVideo.Entregue
        || (status == StatusVideo.EmEdicao && notificacao.Tipo == TipoNotificacao.PrazoEdicao);
      if (!encerrar) continue;
      notificacao.ConfirmadaEm = DateTime.UtcNow;
      await _notificacaoRepository.AtualizarAsync(notificacao);
    }
  }

  public async Task<Video> ObterVideoPorIdAsync(int id) => await ValidarExistentePorId(id);

  public async Task<IEnumerable<Video>> ListarVideosAsync(string? status)
  {
    if (!string.IsNullOrWhiteSpace(status) && !StatusVideo.Todos.Contains(status))
      throw new Exception("Status do vídeo inválido.");
    return await _videoRepository.ListarAsync(status);
  }

  public async Task DeletarVideoAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    await _videoRepository.DeletarAsync(existente.ID);
  }

  #region Úteis
  private async Task ValidarInformacoes(Video video)
  {
    if (string.IsNullOrWhiteSpace(video.Titulo))
      throw new Exception("O título do vídeo não pode ser vazio.");
    if (video.PrazoEntrega < video.PrazoEdicao)
      throw new Exception("O prazo de entrega não pode ser antes do prazo de edição.");
    if (video.EventoID != null && await _eventoRepository.ObterPorIdAsync(video.EventoID.Value) == null)
      throw new Exception("Evento não localizado.");
  }

  private async Task<Video> ValidarExistentePorId(int id)
  {
    var existente = await _videoRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Vídeo não localizado.");
    return existente;
  }
  #endregion
}
