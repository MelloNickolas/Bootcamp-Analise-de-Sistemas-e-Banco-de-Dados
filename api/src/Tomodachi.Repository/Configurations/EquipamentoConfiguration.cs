using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class EquipamentoConfiguration : IEntityTypeConfiguration<Equipamento>
{
  public void Configure(EntityTypeBuilder<Equipamento> builder)
  {
    builder.ToTable("equipamento");
    builder.HasKey(equipamento => equipamento.ID);
    builder.Property(equipamento => equipamento.ID).HasColumnName("id");
    builder.Property(equipamento => equipamento.Nome).HasColumnName("nome").IsRequired(true);
    builder.Property(equipamento => equipamento.Descricao).HasColumnName("descricao").IsRequired(false);
    builder.Property(equipamento => equipamento.Ativo).HasColumnName("ativo");
  }
}
