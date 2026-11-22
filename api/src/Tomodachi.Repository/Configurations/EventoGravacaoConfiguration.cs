using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class EventoGravacaoConfiguration : IEntityTypeConfiguration<EventoGravacao>
{
  public void Configure(EntityTypeBuilder<EventoGravacao> builder)
  {
    builder.ToTable("evento_gravacao");
    builder.HasKey(evento => evento.ID);
    builder.Property(evento => evento.ID).HasColumnName("id");
    builder.Property(evento => evento.Titulo).HasColumnName("titulo").IsRequired(true);
    builder.Property(evento => evento.LocalID).HasColumnName("local_id");
    builder.Property(evento => evento.ClienteID).HasColumnName("cliente_id").IsRequired(false);
    builder.Property(evento => evento.Inicio).HasColumnName("inicio").HasColumnType("timestamp with time zone");
    builder.Property(evento => evento.Fim).HasColumnName("fim").HasColumnType("timestamp with time zone");
    builder.Property(evento => evento.Status).HasColumnName("status").IsRequired(true);

    builder.HasOne(evento => evento.Local).WithMany().HasForeignKey(evento => evento.LocalID);

    // Sem navegação para o cliente: a logo é pesada e o app busca os clientes à parte
    builder.HasOne<Cliente>().WithMany().HasForeignKey(evento => evento.ClienteID).OnDelete(DeleteBehavior.SetNull);
  }
}
