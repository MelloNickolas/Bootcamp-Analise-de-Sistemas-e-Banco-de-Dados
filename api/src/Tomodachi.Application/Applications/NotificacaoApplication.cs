using Tomodachi.Application.Helpers;
using Tomodachi.Application.Interfaces;
using Tomodachi.Application.Models;
using Tomodachi.Domain.Constantes;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;
using Tomodachi.Services.Interfaces;

namespace Tomodachi.Application.Applications;

public class NotificacaoApplication : INotificacaoApplication
{
  private readonly INotificacaoRepository _notificacaoRepository;
  private readonly IDispositivoRepository _dispositivoRepository;
  private readonly IPushService _pushService;
  private readonly IConfiguracaoApplication _configuracaoApplication;

  public NotificacaoApplication(INotificacaoRepository notificacaoRepository, IDispositivoRepository dispositivoRepository, IPushService pushService, IConfiguracaoApplication configuracaoApplication)
  {
    _notificacaoRepository = notificacaoRepository;
    _dispositivoRepository = dispositivoRepository;
    _pushService = pushService;
    _configuracaoApplication = configuracaoApplication;
  }

  public async Task<IEnumerable<Notificacao>> ListarAbertasAsync() => await _notificacaoRepository.ListarAbertasAsync();

  public async Task ConfirmarAsync(int id)
  {
    var existente = await _notificacaoRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Notificação não localizada.");
    if (existente.ConfirmadaEm != null) throw new Exception("A notificação já foi confirmada.");
    existente.ConfirmadaEm = DateTime.UtcNow;
    await _notificacaoRepository.AtualizarAsync(existente);
  }

  // Chamado a cada minuto por um agendador externo. Envia o que venceu e agenda a próxima repetição.
  public async Task<ResultadoProcessamento> ProcessarPendentesAsync()
  {
    var agora = DateTime.UtcNow;

    // Horário de silêncio (definido no app): os avisos vencidos ficam esperando e saem quando ele termina
    var silencio = await _configuracaoApplication.ObterSilencioAsync();
    if (AgendamentoHelper.EmHorarioDeSilencio(agora, silencio.SilencioAtivo, silencio.SilencioInicio, silencio.SilencioFim))
      return new ResultadoProcessamento(0, 0, 0,
        $"Horário de silêncio ({silencio.SilencioInicio}h às {silencio.SilencioFim}h): os avisos pendentes saem a partir das {silencio.SilencioFim}h.");

    var pendentes = (await _notificacaoRepository.ListarPendentesAteAsync(agora)).ToList();
    if (pendentes.Count == 0) return new ResultadoProcessamento(0, 0, 0, "Nenhuma notificação para enviar agora.");

    var tokens = (await _dispositivoRepository.ListarAsync()).Select(dispositivo => dispositivo.TokenFcm).ToList();
    if (tokens.Count == 0)
      return new ResultadoProcessamento(pendentes.Count, 0, 0, "Há notificações vencidas, mas nenhum aparelho cadastrado.");

    int enviadas = 0, encerradas = 0;
    foreach (var notificacao in pendentes)
    {
      // O item já foi concluído: encerra sem enviar
      if (ItemConcluido(notificacao))
      {
        notificacao.ConfirmadaEm = agora;
        await _notificacaoRepository.AtualizarAsync(notificacao);
        encerradas++;
        continue;
      }

      var (titulo, corpo) = MontarMensagem(notificacao);
      await _pushService.EnviarAsync(tokens, titulo, corpo);
      enviadas++;

      if (notificacao.Repete)
        notificacao.ProximoEnvio = ProximaRepeticao(notificacao.ProximoEnvio, agora);
      else
        notificacao.ConfirmadaEm = agora;
      await _notificacaoRepository.AtualizarAsync(notificacao);
    }
    return new ResultadoProcessamento(pendentes.Count, enviadas, encerradas, "Processamento concluído.");
  }

  #region Úteis
  // Próximo envio a partir do horário combinado (não de quando o envio saiu), para os horários não se desalinharem.
  // Se o servidor ficou parado e perdeu rodadas, pula para a primeira que ainda está no futuro.
  private static DateTime ProximaRepeticao(DateTime envioAnterior, DateTime agoraUtc)
  {
    var proximo = envioAnterior.ToUniversalTime();
    do
    {
      proximo = proximo.AddHours(AgendamentoHelper.HorasRepeticao);
    } while (proximo <= agoraUtc);
    return proximo;
  }

  private static bool ItemConcluido(Notificacao notificacao)
  {
    if (notificacao.Evento != null)
      return notificacao.Evento.Status == StatusEvento.Realizado || notificacao.Evento.Status == StatusEvento.Cancelado;

    if (notificacao.Video != null)
    {
      if (notificacao.Tipo == TipoNotificacao.PrazoEdicao)
        return notificacao.Video.Status != StatusVideo.AEditar;
      return notificacao.Video.Status == StatusVideo.Entregue;
    }
    return false;
  }

  private static (string Titulo, string Corpo) MontarMensagem(Notificacao notificacao) => notificacao.Tipo switch
  {
    TipoNotificacao.Gravacao when AgendamentoHelper.EhDiaInteiro(notificacao.Evento!.Inicio, notificacao.Evento.Fim) =>
      ("Gravação em breve", $"{notificacao.Evento.Titulo} é no dia {AgendamentoHelper.DiaLocal(notificacao.Evento.Inicio)}, dia inteiro."),
    TipoNotificacao.Gravacao =>
      ("Gravação em breve", $"{notificacao.Evento?.Titulo} começa em {AgendamentoHelper.DataLocal(notificacao.Evento!.Inicio)}."),
    TipoNotificacao.PrazoEdicao =>
      ("Prazo de edição", $"{notificacao.Video?.Titulo} precisa estar editado até {AgendamentoHelper.DataLocal(notificacao.Video!.PrazoEdicao)}."),
    TipoNotificacao.PrazoEntrega =>
      ("Prazo de entrega", $"{notificacao.Video?.Titulo} deve ser entregue até {AgendamentoHelper.DataLocal(notificacao.Video!.PrazoEntrega)}."),
    TipoNotificacao.AvisoEquipamento =>
      ("Equipamento reservado", $"Há equipamentos reservados para {notificacao.Evento?.Titulo}."),
    _ => ("Aviso", "Você tem um aviso pendente.")
  };
  #endregion
}
