using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class DispositivoConfiguration : IEntityTypeConfiguration<Dispositivo>
{
  public void Configure(EntityTypeBuilder<Dispositivo> builder)
  {
    builder.ToTable("dispositivo");
    builder.HasKey(dispositivo => dispositivo.ID);
    builder.Property(dispositivo => dispositivo.ID).HasColumnName("id");
    builder.Property(dispositivo => dispositivo.TokenFcm).HasColumnName("token_fcm").IsRequired(true);
    builder.Property(dispositivo => dispositivo.NomeAparelho).HasColumnName("nome_aparelho").IsRequired(false);
  }
}
