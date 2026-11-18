using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class ConfiguracaoNotificacaoConfiguration : IEntityTypeConfiguration<ConfiguracaoNotificacao>
{
  public void Configure(EntityTypeBuilder<ConfiguracaoNotificacao> builder)
  {
    builder.ToTable("configuracao_notificacao");
    builder.HasKey(configuracao => configuracao.ID);
    builder.Property(configuracao => configuracao.ID).HasColumnName("id").ValueGeneratedNever();
    builder.Property(configuracao => configuracao.SilencioAtivo).HasColumnName("silencio_ativo");
    builder.Property(configuracao => configuracao.SilencioInicio).HasColumnName("silencio_inicio");
    builder.Property(configuracao => configuracao.SilencioFim).HasColumnName("silencio_fim");
  }
}
