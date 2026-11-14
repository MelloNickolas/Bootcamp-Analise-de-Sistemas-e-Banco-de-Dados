using Tomodachi.Application.Interfaces;
using Tomodachi.Domain.Entities;
using Tomodachi.Repository.Interfaces;

namespace Tomodachi.Application.Applications;

public class EquipamentoApplication : IEquipamentoApplication
{
  private readonly IEquipamentoRepository _equipamentoRepository;
  public EquipamentoApplication(IEquipamentoRepository equipamentoRepository) => _equipamentoRepository = equipamentoRepository;

  public async Task<int> CriarEquipamentoAsync(Equipamento equipamento)
  {
    if (equipamento == null) throw new Exception("Equipamento não pode ser vazio.");
    ValidarInformacoes(equipamento);
    return await _equipamentoRepository.SalvarAsync(equipamento);
  }

  public async Task AtualizarEquipamentoAsync(Equipamento equipamento)
  {
    var existente = await ValidarExistentePorId(equipamento.ID);
    ValidarInformacoes(equipamento);
    existente.Nome = equipamento.Nome;
    existente.Descricao = equipamento.Descricao;
    existente.Ativo = equipamento.Ativo;
    await _equipamentoRepository.AtualizarAsync(existente);
  }

  public async Task<Equipamento> ObterEquipamentoPorIdAsync(int id) => await ValidarExistentePorId(id);
  public async Task<IEnumerable<Equipamento>> ListarEquipamentosAsync() => await _equipamentoRepository.ListarAsync();

  public async Task DeletarEquipamentoAsync(int id)
  {
    var existente = await ValidarExistentePorId(id);
    await _equipamentoRepository.DeletarAsync(existente);
  }

  #region Úteis
  private static void ValidarInformacoes(Equipamento equipamento)
  {
    if (string.IsNullOrWhiteSpace(equipamento.Nome))
      throw new Exception("O nome do equipamento não pode ser vazio.");
  }
  private async Task<Equipamento> ValidarExistentePorId(int id)
  {
    var existente = await _equipamentoRepository.ObterPorIdAsync(id);
    if (existente == null) throw new Exception("Equipamento não localizado.");
    return existente;
  }
  #endregion
}
