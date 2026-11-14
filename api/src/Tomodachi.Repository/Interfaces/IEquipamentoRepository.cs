using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IEquipamentoRepository
{
  Task<int> SalvarAsync(Equipamento equipamento);
  Task AtualizarAsync(Equipamento equipamento);
  Task<Equipamento?> ObterPorIdAsync(int id);
  Task<IEnumerable<Equipamento>> ListarAsync();
  Task DeletarAsync(Equipamento equipamento);
}
