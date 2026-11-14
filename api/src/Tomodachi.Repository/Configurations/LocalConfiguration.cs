using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class LocalConfiguration : IEntityTypeConfiguration<Local>
{
  public void Configure(EntityTypeBuilder<Local> builder)
  {
    builder.ToTable("local");
    builder.HasKey(local => local.ID);
    builder.Property(local => local.ID).HasColumnName("id");
    builder.Property(local => local.Nome).HasColumnName("nome").IsRequired(true);
    builder.Property(local => local.Endereco).HasColumnName("endereco").IsRequired(false);
  }
}
