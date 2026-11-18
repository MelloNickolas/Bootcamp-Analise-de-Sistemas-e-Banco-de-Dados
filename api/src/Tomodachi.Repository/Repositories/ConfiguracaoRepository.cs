using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Repository.Repositories;

public class ConfiguracaoRepository : BaseRepository, IConfiguracaoRepository
{
  public ConfiguracaoRepository(TomodachiDbContext context) : base(context) { }

  public async Task<ConfiguracaoNotificacao?> ObterAsync()
    => await _context.Configuracoes.AsNoTracking().FirstOrDefaultAsync(configuracao => configuracao.ID == 1);

  // A tabela tem uma única linha: atualiza se existir, senão cria
  public async Task SalvarAsync(ConfiguracaoNotificacao configuracao)
  {
    var existente = await _context.Configuracoes.FirstOrDefaultAsync(item => item.ID == 1);
    if (existente == null)
    {
      configuracao.ID = 1;
      _context.Configuracoes.Add(configuracao);
    }
    else
    {
      existente.SilencioAtivo = configuracao.SilencioAtivo;
      existente.SilencioInicio = configuracao.SilencioInicio;
      existente.SilencioFim = configuracao.SilencioFim;
    }
    await _context.SaveChangesAsync();
  }
}
