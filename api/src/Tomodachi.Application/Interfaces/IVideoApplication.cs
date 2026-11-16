using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IVideoApplication
{
  Task<int> CriarVideoAsync(Video video);
  Task AtualizarVideoAsync(Video video);
  Task AlterarStatusAsync(int id, string status);
  Task<Video> ObterVideoPorIdAsync(int id);
  Task<IEnumerable<Video>> ListarVideosAsync(string? status);
  Task DeletarVideoAsync(int id);
}
