using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class NotificacaoConfiguration : IEntityTypeConfiguration<Notificacao>
{
  public void Configure(EntityTypeBuilder<Notificacao> builder)
  {
    builder.ToTable("notificacao");
    builder.HasKey(notificacao => notificacao.ID);
    builder.Property(notificacao => notificacao.ID).HasColumnName("id");
    builder.Property(notificacao => notificacao.EventoID).HasColumnName("evento_id").IsRequired(false);
    builder.Property(notificacao => notificacao.VideoID).HasColumnName("video_id").IsRequired(false);
    builder.Property(notificacao => notificacao.Tipo).HasColumnName("tipo").IsRequired(true);
    builder.Property(notificacao => notificacao.ProximoEnvio).HasColumnName("proximo_envio").HasColumnType("timestamp with time zone");
    builder.Property(notificacao => notificacao.Repete).HasColumnName("repete");
    builder.Property(notificacao => notificacao.ConfirmadaEm).HasColumnName("confirmada_em").HasColumnType("timestamp with time zone");

    builder.HasOne(notificacao => notificacao.Evento).WithMany().HasForeignKey(notificacao => notificacao.EventoID);
    builder.HasOne(notificacao => notificacao.Video).WithMany().HasForeignKey(notificacao => notificacao.VideoID);
  }
}
