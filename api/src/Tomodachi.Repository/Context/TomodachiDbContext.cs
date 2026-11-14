using Microsoft.EntityFrameworkCore;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Configurations;

namespace Tomodachi.Repository.Context;

public class TomodachiDbContext : DbContext
{
  public TomodachiDbContext(DbContextOptions<TomodachiDbContext> options) : base(options) { }

  public DbSet<Local> Locais { get; set; } = null!;
  public DbSet<Equipamento> Equipamentos { get; set; } = null!;
  public DbSet<EventoGravacao> Eventos { get; set; } = null!;
  public DbSet<ReservaEquipamento> Reservas { get; set; } = null!;
  public DbSet<Video> Videos { get; set; } = null!;
  public DbSet<Notificacao> Notificacoes { get; set; } = null!;
  public DbSet<Dispositivo> Dispositivos { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.ApplyConfiguration(new LocalConfiguration());
    modelBuilder.ApplyConfiguration(new EquipamentoConfiguration());
    modelBuilder.ApplyConfiguration(new EventoGravacaoConfiguration());
    modelBuilder.ApplyConfiguration(new ReservaEquipamentoConfiguration());
    modelBuilder.ApplyConfiguration(new VideoConfiguration());
    modelBuilder.ApplyConfiguration(new NotificacaoConfiguration());
    modelBuilder.ApplyConfiguration(new DispositivoConfiguration());
  }
}
