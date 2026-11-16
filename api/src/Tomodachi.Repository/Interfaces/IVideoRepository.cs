using Tomodachi.Domain.Entities;

namespace Tomodachi.Repository.Interfaces;

public interface IVideoRepository
{
  Task<int> SalvarAsync(Video video);
  Task AtualizarAsync(Video video);
  Task<Video?> ObterPorIdAsync(int id);
  Task<IEnumerable<Video>> ListarAsync(string? status);
  Task DeletarAsync(int id);
}
