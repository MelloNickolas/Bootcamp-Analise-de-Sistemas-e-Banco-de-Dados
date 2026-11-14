using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Configurations;

public class ReservaEquipamentoConfiguration : IEntityTypeConfiguration<ReservaEquipamento>
{
  public void Configure(EntityTypeBuilder<ReservaEquipamento> builder)
  {
    builder.ToTable("reserva_equipamento");
    builder.HasKey(reserva => reserva.ID);
    builder.Property(reserva => reserva.ID).HasColumnName("id");
    builder.Property(reserva => reserva.EventoID).HasColumnName("evento_id");
    builder.Property(reserva => reserva.EquipamentoID).HasColumnName("equipamento_id");

    // "periodo" não entra no modelo: o gatilho do banco preenche ao inserir.
    // "ativa" também vem do banco (gatilho) e só é lida.
    builder.Property(reserva => reserva.Ativa).HasColumnName("ativa").ValueGeneratedOnAddOrUpdate();

    builder.HasOne(reserva => reserva.Evento).WithMany(evento => evento.Reservas).HasForeignKey(reserva => reserva.EventoID);
    builder.HasOne(reserva => reserva.Equipamento).WithMany().HasForeignKey(reserva => reserva.EquipamentoID);
  }
}
