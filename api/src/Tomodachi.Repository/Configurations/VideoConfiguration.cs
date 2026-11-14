using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
  public void Configure(EntityTypeBuilder<Video> builder)
  {
    builder.ToTable("video");
    builder.HasKey(video => video.ID);
    builder.Property(video => video.ID).HasColumnName("id");
    builder.Property(video => video.Titulo).HasColumnName("titulo").IsRequired(true);
    builder.Property(video => video.EventoID).HasColumnName("evento_id").IsRequired(false);
    builder.Property(video => video.Status).HasColumnName("status").IsRequired(true);
    builder.Property(video => video.PrazoEdicao).HasColumnName("prazo_edicao").HasColumnType("timestamp with time zone");
    builder.Property(video => video.PrazoEntrega).HasColumnName("prazo_entrega").HasColumnType("timestamp with time zone");

    builder.HasOne(video => video.Evento).WithMany().HasForeignKey(video => video.EventoID);
  }
}
