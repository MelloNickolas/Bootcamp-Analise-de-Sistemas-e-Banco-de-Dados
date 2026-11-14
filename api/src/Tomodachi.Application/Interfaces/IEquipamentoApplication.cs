using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IEquipamentoApplication
{
  Task<int> CriarEquipamentoAsync(Equipamento equipamento);
  Task AtualizarEquipamentoAsync(Equipamento equipamento);
  Task<Equipamento> ObterEquipamentoPorIdAsync(int id);
  Task<IEnumerable<Equipamento>> ListarEquipamentosAsync();
  Task DeletarEquipamentoAsync(int id);
}
