using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class CategoriaEquipamentoConfiguration : IEntityTypeConfiguration<CategoriaEquipamento>
{
  public void Configure(EntityTypeBuilder<CategoriaEquipamento> builder)
  {
    builder.ToTable("categoria_equipamento");
    builder.HasKey(categoria => categoria.ID);
    builder.Property(categoria => categoria.ID).HasColumnName("id");
    builder.Property(categoria => categoria.Nome).HasColumnName("nome").IsRequired(true);
  }
}
