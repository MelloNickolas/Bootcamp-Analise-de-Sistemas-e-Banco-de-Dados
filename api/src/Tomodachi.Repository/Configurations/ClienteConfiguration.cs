using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
  public void Configure(EntityTypeBuilder<Cliente> builder)
  {
    builder.ToTable("cliente");
    builder.HasKey(cliente => cliente.ID);
    builder.Property(cliente => cliente.ID).HasColumnName("id");
    builder.Property(cliente => cliente.Nome).HasColumnName("nome").IsRequired(true);
    builder.Property(cliente => cliente.Cor).HasColumnName("cor").IsRequired(true);
    builder.Property(cliente => cliente.Logo).HasColumnName("logo").IsRequired(false);
  }
}
